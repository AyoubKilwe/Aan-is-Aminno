# Aan Is Aamino — "Let's trust each other"

A mobile-first web app that helps a women's savings group (**hagbad**) invest their savings safely and halal.

**Problem:** A women's savings group has saved for years but doesn't know which businesses to put the money into.

## Features
1. **Our Hagbad (Home)**: the group's savings drawn as a circle of members around one pot. 20% is kept as a safety reserve, and the rest is shown as available or invested.
2. **Businesses**: local businesses seeking investment, ranked by a transparent **trust score**. Each one shows how many months it takes to earn back the money, plus a check of what happens if sales drop 30%.
3. **Verify in person**: owners self-report only 85 of the 100 points. The last 15 points come only when the group visits, sees the record book, and speaks with the guarantor.
4. **List a business**: a 3-step form for owners that ends with their trust score and the reasons behind it.
5. **AI Advisor (Gemini)**: halal-only advice that knows the group's savings, reserve and the local listings. It is clearly labelled as AI. It retries if the model is busy and falls back to prepared answers offline.
6. **Mudaraba agreements**: profit-sharing contracts with no riba, in English or Somali. Groups can share them on WhatsApp, print them, and record monthly profit to track how much has been earned back.

English and Somali (EN / SO). Light and dark appearance follow the device. The design follows Apple's Human Interface Guidelines: tab bar for navigation only, sheets for tasks, 44px touch targets, and text contrast of at least 4.5:1.

## Run
```bash
npm install
cp .env.example .env   # then paste your free key from https://aistudio.google.com
npm run dev
```
Without a key, the advisor uses prepared offline answers.

> Demo data: the listed businesses are sample data for the hackathon demo.
