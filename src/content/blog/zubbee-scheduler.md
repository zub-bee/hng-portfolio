During my time in the HNG internship, I worked on several challenging individual stages and collaborated on team projects. Out of all the tasks, two specific milestones stood out as the most technically demanding and rewarding: the Zubbee Scheduler (individual stage) and the SkillBridge API (team task). Here is the technical breakdown of both systems, what broke, and what I learned from them.

# Zubbee - Scheduler

## What it was

We were asked to build a background scheduler that is lightweight and self-contained with priority handling using a min heap, automatic retries, a dead-letter queue (DLQ) for failed tasks, DAG-based task dependency workflows, and a live monitoring dashboard.

## The problem it was solving

Production apps often need to process time-consuming asynchronous tasks (like sending notifications or parsing large files) without blocking the main event loop. While robust solutions like BullMQ exist, they require heavy external dependencies like Redis. A custom background scheduler can solve this by providing priority queuing, timing-wheel execution, and workflow orchestration for an internal developer team.

## How I approached it

My biggest strength, which I currently attribute to the system design task in stage 4, was understanding the requirements of a system and finding out the simplest way to approach it. A winning solution is a simple one. As said in this conversation with Bassem Dghaidi on Beyond Coding, “you can do a lot with very little.” He breaks down how to think about system design when real business impact is on the line. You can pause and check it out.

<iframe width="560" height="315" src="https://www.youtube.com/embed/LeUUxLRdvho?si=MwqhnlN-FA8XM8cd" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

For me, approaching a problem, I ask what the requirements are and what the simplest system can be to fit those requirements. Having to do system design in stage 4, I designed my own approach to technical problems.

In my tribute to simplicity, I built this background scheduler on my already existing retry engine. Part of the requirements of this scheduler, the retry engine already did some of that, so I thought it made sense to just build on it, which cost me a little down the line.

Here are the requirements and how I implemented them.

1. **An alternative scheduling algorithm must be benchmarked against the heap and documented.** Among the choices given of Timing wheels, Indexed priority queues and Skip lists, I chose the timing wheel algorithm because it seemed like the most straightforward. I’d like to pretend like it was because of good system design principles, but I was on a short timeline so… I implemented the timing algorithm a bit differently, though. Although it was a scheduling algorithm, I included priority-based scheduling in its functionality so that it still worked the same way the heap does. That meant deciding where to place it in the timing wheel without having to compare it with every element as the heap does. After the benchmark test was done, surprised to say it was actually way faster to insert elements than the heap data structure. That was a big discovery.
2. **Duplication prevention. In a multiple-worker system, no two workers must pick a job at the same time.** In this case, I decided to use a simple lockedAt column on every job to indicate when a job has been started for processing, but this wasn’t a failsafe eventually. More on that later.
3. **Starvation prevention: Low-priority jobs should not wait forever while high-priority jobs keep jumping the queue. So the longer a job sits, the higher its effective priority becomes.** My approach was simply checking the time differences of each of the jobs first before comparing jobs by their created time by their priority, their scheduled time and their created time. If a job had stayed in the queue for more than 2 mins (my threshold) then it would be picked over the other job.
4. **DAG Workflow: The relationship between jobs must be a directional acyclic graph.** To keep this relationship, I created a table to store jobs and their dependencies. Each jobId had a job dependency id, and both were primary keys in the table, meaning that their relationship cannot be repeated.

## What broke and how I fixed it

My biggest issue was when I realised the database locking tradeoff of SQLite. SQLite by nature, prevents concurrent reads and writes on a database file such that one read operation blocks another write operation. This could cause problems because if both the Express API and the background worker were constantly querying and modifying the same SQLite database, they could repeatedly run into `SQLITE_BUSY` database lock errors under load.
My fix was to update the SQLite connection settings to enable Write-Ahead Logging (`journal_mode=WAL`). This allowed multiple processes to perform concurrent reads while a write transaction was active, eliminating lock contention.

However…

The issue wasn’t completely solved because although reads and writes can happen concurrently, two writes were still blocked at the same time, meaning a write to the database file blocks another write. This could lead to issues in the system.
I acknowledged this tradeoff and utilised it to create a failsafe duplicate prevention for my system. For the multiple-worker system, when a job of interest is queried from the database, it must be set to processing in one transaction, thereby preventing any reads to the database. That way, two workers would never read the same job, preventing duplicate actions on one job.
That leaves other issues like the Express server operations and bigger issues for 3-5 workers. I accepted this tradeoff to keep things simple in my system. It was the simplest and most efficient possible solution to the problem, which is good enough.

## What I took away from it

Building this taught me how scheduling data structures are designed from the ground up. I learned how to balance memory and time complexity (benchmarking heap vs. timing wheel) and how SQLite handles concurrency in real-world environments. It has introduced me to the concept of data structures and algorithms and how they translate to systems in our everyday products. I got to learn how to implement two of those, which was cool. Above all, I saw how following the simplest method can turn out well and make better solutions.

## Why I picked it

I chose this project because it forced me to implement core computer science data structures (like Heaps and circular Timing Wheels) instead of just relying on ready-made npm packages, teaching me the underlying mechanics of background workers. It was almost my most challenging and most fun because there were many moving parts that needed to be considered. Throughout every piece of the system, I thought about the requirements and how they all work together. If one piece fails, the others are more likely to.

---

# The SkillBridge API

## What it was

The backend API for SkillBridge, an AI-powered talent assessment and employer-candidate matching platform built collaboratively using NestJS, TypeScript, PostgreSQL, and TypeORM.

## The problem it was solving

The platform connects candidates and employers by running AI-driven skill assessments to validate the talent pool while giving employers an opportunity to find them through job postings, custom assessments and offers. However, the system had critical stability issues while we were building, and I contributed to fixing those issues while implementing new features. For example, the LLM frequently generated fake reference links (URL hallucinations) during the AI guidance report after assessments and when prompted to generate resource links for talent. Some of the features I built are the employer trust and verification layer to prevent unverified employers from initiating actions, and the employer-talent offer and shortlist feature, where talent can be shortlisted and sent an offer. Both receive notifications of activity related to the job offer.

## Some of my contributions: what broke and how I fixed it

I initially integrated resource links for the AI guidance layer for the completion result of advanced assessments and the general resources page independent of assessment results, but the generated resources from AI were usually hallucinated, and so most of the links were broken. To solve this issue, I built a validation service leveraging the YouTube Data API v3 and Serper.dev Google Search to check and filter AI-generated resources, swapping out hallucinated links. This was a non-breaking change that added a layer of verification to the AI-generated resources. For every title, description and link text generated, the title and description are used as a query to fetch data from either API depending on whether it was a video or not. Because the title and description were usually detailed, it mostly worked. Mostly. After many iterations, we came close to only 5% broken links compared to 95% before.

Another issue with the AI-generated resource links was the long wait times on the page, which were really bad for UX. I added configurable timeouts with background cache warming so that for any new change in the talent profile, such as completing onboarding or an assessment, the generation service is automatically triggered in the background and saved into the database so that when the user lands on the resource page, the page load is instant. This improved the overall customer experience. As previously stated, page load wait time moved from an average of 3 minutes to none.

I designed the employer verification pipeline, implementing SSRF-hardened reachability checks for company websites and LinkedIn verification gates to prevent unverified outreach to talent. Among many others were refactoring skill assessments to strict MCQ scoring to reduce the wait time that came from AI trying to score open text. Since we already had rubric scoring for the MCQ, assessment results became instant, going from about 3 mins previously.

## My grave lessons

Working on SkillBridge taught me how to collaborate effectively in a larger codebase. Enforcing API standards (response normalisation, snake_case conversion) and contributing 33+ pull requests reinforced my developer discipline. The complexity of working within a team. Resolving real-world security vulnerabilities, optimising performance, and handling LLM hallucination issues gave me a strong appreciation for defensive API design.
Thinking about how my new feature could break the product or make it was good paranoia. I also learnt more than just writing code. I learnt how to use AI-assisted programming in the best way to both meet the demands of my team in increasing my productivity and also learn. I was in the best balance of speed and growth. My biggest lesson was the understanding that people are the major thing in every product and not just the thing. I learnt how interactions and communication make or break a product. Without putting myself out there to take chances and contribute, I will never be a productive developer. Basically, you're not that special (maybe genuises), and nobody is going to pause their own business to ask for your contributions. They just value who gives it first. Not fair but who cares? Personally, this was the highlight of my HNG experience.

## Why I picked it

I picked these handful of tasks among many others because these were the times I thought about the product like my own. These were also times where I made the decisions without having to be told. I recently read an article that I agree with and changed my perspective on how to work in teams together on a product. The best engineers think about the product and they're not just there to be assigned tasks. They're involved in the decision process they attend all the meetings. They know what's happening across the other teams like marketing or finance. What are the numbers, what are the customer complaints? I decided to reach towards that during this internship and I have alot more to say about how it helps in the building process. Having an understanding of all the moving parts outside of just the code is what enabled me to think passionately about what the product needs. These were implementations
that I wasn't asked to do simply because I tested the product and I invested my mind into solving as many issues as I could. I think that's the cheat code to being a builder others would like to work with. It made it easier to work and I'm going to keep applying this in other teams too. The ability to code with an understanding of all the moving parts is my highlight of this experience. I know I've said that already. Last time.

I think...
