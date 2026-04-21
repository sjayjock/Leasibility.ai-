# Manus Workflow Guide

## Purpose

This guide gives Stephen a simple, repeatable way to use Manus with the Leasibility.ai GitHub repository going forward. It is written for someone who has **never done this before**. The goal is to make the workflow clear, practical, and easy to repeat.

The main idea is simple:

> **Keep the code in GitHub. Keep the important context documents in the Manus project folder. Use each project chat for one clear task. Push all finished work back to GitHub.**

## Part 1: Connect the Manus Project Folder to the GitHub Repo

Stephen already has a Manus project folder called something like **“Leasibility AI APP.”** That project folder should become the main home for ongoing Leasibility.ai build work.

### What to understand first

Manus already has **GitHub integration built in**. That means when Stephen opens a new chat inside the project folder, he can tell Manus which repository to use, and Manus can pull the latest code, make changes, commit them, and push them back.

Stephen does **not** need to upload the whole codebase as project documents. The GitHub repo is the source for the code. The project documents are only for the small number of files that give every new chat the right context immediately.

### Step-by-step setup

| Step | Exact action to take | Why it matters |
|---|---|---|
| 1 | Open the Manus project folder called **Leasibility AI APP** | This keeps all Leasibility.ai work in one place |
| 2 | Start a **new chat inside that project** | Each build session should happen inside the project |
| 3 | In the first message, tell Manus to use the repo: **“Pull the latest from sjayjock/Leasibility.ai and review docs/current-state.md, docs/next-actions.md, and docs/decisions.md.”** | This tells Manus where the live code is and which docs define the current truth |
| 4 | Upload these three docs as project documents: `docs/current-state.md`, `docs/next-actions.md`, and `docs/decisions.md` | These are the fastest way to give every new chat the current context |
| 5 | Do **not** upload the entire codebase as project documents | The repo already holds the code, and Manus can pull it from GitHub |
| 6 | If the docs change later, re-upload the updated versions as project documents | This keeps future chats aligned to the newest state |

### The three files Stephen should upload as project documents

| File | Why this one matters |
|---|---|
| `current-state.md` | Tells Manus what already exists and what stage the app is in |
| `next-actions.md` | Tells Manus what matters most right now |
| `decisions.md` | Tells Manus the final approved rules so it does not reopen old debates |

### What Stephen should **not** do

Stephen should not upload every source file, every ZIP, or the whole repository as project documents. That creates clutter and confusion. The correct split is:

| Keep in GitHub repo | Keep as Manus project documents |
|---|---|
| Codebase | `current-state.md` |
| Technical files | `next-actions.md` |
| App assets | `decisions.md` |
| Full document history | Only the few key context docs that every chat needs |

## Part 2: How to Use the Project Folder with GitHub Going Forward

Once the project folder is set up, Stephen should use it in a very consistent way.

### The best opening line for a new project chat

Every new build chat should start with something close to this:

> **Pull the latest from sjayjock/Leasibility.ai and review docs/current-state.md and docs/next-actions.md.**

If the task depends on final approved rules, Stephen should also add:

> **Also review docs/decisions.md before making changes.**

This opening line helps Manus start from the current repo state instead of guessing.

### One chat = one scoped task

Each chat should have **one clear task** and **one clear deliverable**. This is the safest and cleanest way to work.

| Good chat scope | Why it works |
|---|---|
| Fix the pricing page copy and trial language | One focused outcome |
| Rebuild the file upload flow for PDFs and phone photos | One focused outcome |
| Add dual-mode intake to the new-project flow | One focused outcome |
| Run testing on PDF export and fix issues | One focused outcome |

| Bad chat scope | Why it causes problems |
|---|---|
| Rebuild the whole app and fix every issue | Too broad |
| Review everything and decide what to do | Too vague |
| Work on pricing, onboarding, bugs, design, and deployment all at once | Too many moving parts |

### What to do at the end of every work chat

At the end of each real work session, Manus should:

| End-of-chat action | Why it matters |
|---|---|
| Commit the changes | So the work is saved clearly |
| Push the changes to the repo | So GitHub stays current |
| Update `docs/current-state.md` if the app state changed | So the next chat knows what is now true |
| Update `docs/next-actions.md` | So the next work session starts from the right priorities |

### The simple working rule

> **If the app changed, the repo should be pushed, and the state docs should be updated.**

## Part 3: Example Prompts Stephen Can Reuse

Stephen does not need to invent a new prompt style every time. He can reuse simple, direct prompts like the ones below.

### Example 1: Bug fix

> Pull the latest from sjayjock/Leasibility.ai and review docs/current-state.md, docs/next-actions.md, and docs/decisions.md. Then fix the bug where the pricing page still shows the old 7-day trial language. Update all related copy, test the flow, commit, push, and update current-state.md and next-actions.md.

### Example 2: Feature add

> Pull the latest from sjayjock/Leasibility.ai and review docs/current-state.md, docs/next-actions.md, and docs/decisions.md. Then preserve or implement the dual-mode intake flow with Headcount shown first and Custom Program beside it as an available option. Test it, commit, push, and update current-state.md and next-actions.md.

### Example 3: Testing chat

> Pull the latest from sjayjock/Leasibility.ai and review docs/current-state.md, docs/next-actions.md, and docs/decisions.md. Then run end-to-end testing on signup, trial flow, project creation, upload, scenario generation, and PDF export. Fix any high-priority issues you find, commit, push, and update current-state.md and next-actions.md.

### Example 4: Documentation update

> Pull the latest from sjayjock/Leasibility.ai and review docs/current-state.md, docs/next-actions.md, and docs/decisions.md. Then update the documentation to match the latest app state, commit, push, and refresh current-state.md and next-actions.md.

## Part 4: When to Start a New Chat vs. Continue the Same Chat

This is very important.

### Start a **new** chat when:

| Start a new chat if… | Reason |
|---|---|
| The task changes | A new task deserves a fresh scope |
| The chat is getting long and messy | Too much context can slow things down |
| The current task is finished and committed | Clean ending point |
| Stephen wants a different kind of deliverable | Better to separate implementation from strategy or testing |

### Continue the **same** chat when:

| Stay in the same chat if… | Reason |
|---|---|
| The work is still the same task | Keeps the thread focused |
| Manus is still fixing the same bug or feature | No need to restart |
| The deliverable is not done yet | Better continuity |

### Simple rule for Stephen

> **New task, new chat. Same task, same chat.**

And if the chat starts to feel overloaded, start a new one.

## Part 5: How Telegram Fits Into This Workflow

Telegram should not replace the main project chats. It should support them.

### Best use of Telegram

| Use Telegram for… | Why |
|---|---|
| Quick status checks | Fast and lightweight |
| Approvals | Easy way to answer yes/no questions |
| Fast decisions | Good when Manus is blocked and needs direction |
| Simple updates | Useful when Stephen is away from the main project chat |

### Best use of project chats

| Use project chats for… | Why |
|---|---|
| Actual build work | This is where code and docs should be changed |
| Bug fixing | Needs focused working context |
| Feature implementation | Needs repo access and full task handling |
| Testing | Needs structured execution |
| Documentation updates | Needs the project context and repo state |

### Best use of standalone chats

| Use standalone chats for… | Why |
|---|---|
| Throwaway questions | No need to clutter the main project |
| Brainstorming that may not matter later | Keeps the project clean |
| Quick one-off thinking | Good for low-stakes discussion |

### The simple channel rule

> **Telegram is for fast communication. Project chats are for real build work. Standalone chats are for throwaway questions.**

## Part 6: The Easiest Repeatable Workflow for Stephen

If Stephen wants the simplest possible routine, he can follow this exact sequence every time.

| Step | Exact action |
|---|---|
| 1 | Open the **Leasibility AI APP** project folder |
| 2 | Start a **new chat** for the next task |
| 3 | Begin with: **“Pull the latest from sjayjock/Leasibility.ai and review docs/current-state.md, docs/next-actions.md, and docs/decisions.md.”** |
| 4 | Give Manus **one clear task** |
| 5 | Let Manus do the work in the repo |
| 6 | At the end, make sure Manus **commits and pushes** |
| 7 | Make sure `current-state.md` and `next-actions.md` are updated |
| 8 | Start a new chat for the next separate task |

## Final Reminder

The cleanest long-term setup is this:

> **GitHub holds the live code.**  
> **The Manus project folder holds the key context docs.**  
> **Each project chat handles one scoped task.**  
> **Every finished session ends with commit, push, and state-doc updates.**

If Stephen follows that rhythm, the Leasibility.ai project will stay organized, easier to manage, and much easier for Manus to continue from chat to chat without losing context.
