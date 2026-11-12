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

## Architecture
```
React (Vite, port 5173)  ──/api──▶  Express (port 4000)  ──▶  MongoDB (aan-is-aamino)
                                           │
                                           └──▶  Gemini API (key stays on the server)
```
| Collection | What it holds |
|---|---|
| `groups` | The savings group: name, total savings, members |
| `businesses` | Listings with the owner's answers and in-person checks |
| `agreements` | Mudaraba agreements and monthly profit payments |
| `lessons` | Learn videos: built-in, YouTube links, uploaded files (`server/uploads/`) |

### API
| Method | Path | Does |
|---|---|---|
| GET/PUT | `/api/group` | Read / update the group |
| GET/POST | `/api/businesses` | List / register a business (validated) |
| PATCH | `/api/businesses/:id/verify` | Tick an in-person check |
| GET/POST | `/api/agreements` | List / create (server refuses more than the money available) |
| POST | `/api/agreements/:id/payments` | Record monthly profit |
| GET/POST/DELETE | `/api/lessons`, `/api/lessons/upload` | Videos (built-in lessons can't be deleted) |
| POST | `/api/ai` | Ask the advisor; the server reads live data from MongoDB and calls Gemini |

## Run
Needs Node 18+ and MongoDB running locally (or a MongoDB Atlas URI).
```bash
npm install
cp .env.example .env     # add GEMINI_API_KEY; MONGODB_URI defaults to local MongoDB
npm run seed             # demo data: 1 group, 8 businesses, 2 lessons
npm run dev              # API on :4000 + app on http://localhost:5173
```
Production: `npm run build && npm start` serves the app and the API from port 4000.

> Demo data: the listed businesses are sample data for the hackathon demo.
