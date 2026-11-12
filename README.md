# Aan Is Aamino — "Let's trust each other"

A mobile-first web app that helps a women's savings group (**hagbad**) invest their savings safely and halal.

**Problem:** A women's savings group has saved for years but doesn't know which businesses to put the money into.

## Features
1. **🏪 Opportunities**: local businesses seeking investment, ranked by trust score, with "money back in X months" and a **bad-case (−30% sales)** check.
2. **📝 Register**: business owners answer 8 simple questions, step by step.
3. **⭐ Trust Score (0–100)**: transparent scoring with a reason for every point (record book, track record, guarantor, competition, spoilage, payback).
4. **🤖 AI Advisor**: Gemini-powered, knows the group's savings and the local listings, halal-only advice, test new business ideas. Works offline with prepared answers.
5. **📄 Mudaraba Agreement**: profit-sharing contract (no riba) generated in English or Somali, shareable on WhatsApp.

English and Somali (EN / SO toggle).

## Run
```bash
npm install
cp .env.example .env   # then paste your free key from https://aistudio.google.com
npm run dev
```
Without a key, the advisor uses prepared offline answers.

> Demo data: the listed businesses are sample data for the hackathon demo.
