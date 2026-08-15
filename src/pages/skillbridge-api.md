---
title: "Fixing Real Production Pain in SkillBridge API"
projectName: "SkillBridge API"
summary: "From URL hallucination fixes to employer verification and assessment flow stability."
date: 2026-05-01
order: 3
---

# Project Context

The backend API for SkillBridge, an AI-powered talent assessment and employer-candidate matching platform built collaboratively using NestJS, TypeScript, PostgreSQL, and TypeORM.

The platform connects candidates and employers by running AI-driven skill assessments to validate the talent pool while giving employers an opportunity to find them through job postings, custom assessments and offers. However, the system had critical stability issues while we were building, and I contributed to fixing those issues while implementing new features.

# Key Issues I Tackled

- LLM generated fake reference links (URL hallucinations) during the AI guidance report after assessments and when prompted to generate resource links for talent.
- Long page-load wait times on the resource page, leading to a poor user experience.
- Designing an employer verification pipeline and trust layer to prevent unverified outreach to talent.
- Refactoring skill assessments to reduce wait times associated with AI scoring of open text.

# Technical Deep Dive

I initially integrated resource links for the AI guidance layer for the completion result of advanced assessments and the general resources page independent of assessment results, but the generated resources from AI were usually hallucinated, and so most of the links were broken. To solve this issue, I built a validation service leveraging the YouTube Data API v3 and Serper.dev Google Search to check and filter AI-generated resources, swapping out hallucinated links. This was a non-breaking change that added a layer of verification to the AI-generated resources. For every title, description and link text generated, the title and description are used as a query to fetch data from either API depending on whether it was a video or not. Because the title and description were usually detailed, it mostly worked. Mostly. After many iterations, we came close to only 5% broken links compared to 95% before.

Another issue with the AI-generated resource links was the long wait times on the page, which were really bad for UX. I added configurable timeouts with background cache warming so that for any new change in the talent profile, such as completing onboarding or an assessment, the generation service is automatically triggered in the background and saved into the database so that when the user lands on the resource page, the page load is instant. This improved the overall customer experience. As previously stated, page load wait time moved from an average of 3 minutes to none.

I designed the employer verification pipeline, implementing SSRF-hardened reachability checks for company websites and LinkedIn verification gates to prevent unverified outreach to talent. Among many others were refactoring skill assessments to strict MCQ scoring to reduce the wait time that came from AI trying to score open text. Since we already had rubric scoring for the MCQ, assessment results became instant, going from about 3 mins previously.

# Collaboration and PR Flow

Working on SkillBridge taught me how to collaborate effectively in a larger codebase. Enforcing API standards (response normalisation, snake_case conversion) and contributing 33+ pull requests reinforced my developer discipline. The complexity of working within a team. I also learnt the importance of API contracts and how creating them enforces good API design practices and conventions.

# Impact

- Reduced broken AI-generated resource links from 95% to only 5%.
- Brought resource page load times down from 3 minutes to instant via cache warming.
- Designed employer verification gates to secure outreach and prevent unverified actions.
- Assessment result generation went from 3 minutes to instant by moving to MCQ scoring.

# Reflections

Working on SkillBridge taught me how to collaborate effectively in a larger codebase. Resolving real-world security vulnerabilities, optimising performance, and handling LLM hallucination issues gave me a strong appreciation for defensive API design.

Thinking about how my new feature could break the product or make it was good paranoia. I also learnt more than just writing code. I learnt how to use AI-assisted programming in the best way to both meet the demands of my team in increasing my productivity and also learn. I was in the best balance of speed and growth. My biggest lesson was the understanding that people are the major thing in every product and not just the thing. I learnt how interactions and communication make or break a product. Without putting myself out there to take chances and contribute, I will never be a productive developer. Basically, you're not that special (maybe genuises), and nobody is going to pause their own business to ask for your contributions. They just value who gives it first. Not fair but who cares? Personally, this was the highlight of my HNG experience.

I picked these handful of tasks among many others because these were the times I thought about the product like my own. These were also times where I made the decisions without having to be told. I recently read an article that I agree with and changed my perspective on how to work in teams together on a product. The best engineers think about the product and they're not just there to be assigned tasks. They're involved in the decision process they attend all the meetings. They know what's happening across the other teams like marketing or finance. What are the numbers, what are the customer complaints? I decided to reach towards that during this internship and I have alot more to say about how it helps in the building process. Having an understanding of all the moving parts outside of just the code is what enabled me to think passionately about what the product needs. These were implementations that I wasn't asked to do simply because I tested the product and I invested my mind into solving as many issues as I could. I think that's the cheat code to being a builder others would like to work with. It made it easier to work and I'm going to keep applying this in other teams too. The ability to code with an understanding of all the moving parts is my highlight of this experience.
