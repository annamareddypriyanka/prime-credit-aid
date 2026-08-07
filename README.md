# LoanFlow AI

Build a modern, premium AI-powered Loan Underwriting web application with a professional fintech UI. The application should look like an enterprise banking platform rather than a student project. Use a clean white and blue theme with glassmorphism cards, smooth animations, rounded corners, responsive layouts, and professional charts.

Application Name:

AI Dynamic Loan Underwriting System

The application should have the following pages and functionality.

------------------------------------

1. LOGIN PAGE

------------------------------------

Create a professional login page.

Fields:

- Email

- Password

Buttons:

- Login

- Demo Login

Design:

- Banking style

- AI illustration on the side

- Gradient background

- Glass login card

------------------------------------

2. DASHBOARD

------------------------------------

Dashboard should contain KPI cards.

Cards:

Total Applicants

Approved Loans

Rejected Loans

Manual Review

Average Credit Score

Average Fraud Score

Average Monthly Income

Total Loan Amount Requested

Charts:

Loan Approval Distribution

Risk Level Distribution

Credit Score Histogram

Monthly Income Distribution

Loan Type Pie Chart

Fraud Score Distribution

Recent Applications Table

Columns:

Applicant Name

Loan ID

Credit Score

Risk Level

Fraud Score

Approval Status

Action Button

------------------------------------

3. NEW LOAN APPLICATION

------------------------------------

Large multi-step form.

Step 1

Personal Information

Full Name

Age

Gender

Phone

Email

City

State

------------------------------------

Step 2

Employment Details

Employment Type

Company

Designation

Experience

Education

Monthly Income

------------------------------------

Step 3

Loan Details

Loan Amount

Loan Type

Loan Purpose

Existing Loans

Monthly EMI

------------------------------------

Step 4

Alternative Data

LinkedIn Profile Available

GitHub Profile Available

Education Verified

Digital Payment Score

Public Record Score

Consent Given

------------------------------------

Step 5

Fraud Indicators

Device Changed

IP Location Match

Duplicate Application

Suspicious Activity

------------------------------------

Buttons

Previous

Next

Submit Application

------------------------------------

4. APPLICATION RESULT PAGE

------------------------------------

After submission display:

Large AI Risk Score

Fraud Score

Credit Score

Debt To Income Ratio

Approval Status

Risk Level

Reason for Decision

Recommendation

Display a circular progress indicator for Risk Score.

Use green, orange and red colors.

------------------------------------

5. APPLICANT DETAILS PAGE

------------------------------------

Professional profile page.

Sections

Personal Details

Employment

Loan

Financial

Alternative Data

Fraud Indicators

Prediction Result

Timeline

Download PDF Report button

------------------------------------

6. APPLICANT MANAGEMENT PAGE

------------------------------------

Search

Sort

Filters

Filter by

Risk Level

Approval Status

Loan Type

Employment Type

Credit Score Range

Fraud Score Range

Each row should have

View

Edit

Delete

------------------------------------

7. ANALYTICS PAGE

------------------------------------

Interactive charts.

Average Income

Credit Score Heatmap

Risk Trend

Approval Trend

Fraud Detection Statistics

Alternative Data Usage

Employment Type Distribution

State-wise Applicants

City-wise Applicants

Loan Type Distribution

Top Risky Applicants

------------------------------------

8. FRAUD MONITOR PAGE

------------------------------------

Display suspicious applications.

Columns

Applicant

Fraud Score

Duplicate Application

Device Changed

IP Match

Suspicious Activity

Action

Highlight high fraud applications in red.

------------------------------------

9. AI EXPLANATION PAGE

------------------------------------

Explain why the applicant was approved or rejected.

Example:

Credit Score contributed +25

Income contributed +20

High Debt Ratio contributed -18

Fraud Indicators contributed -30

Generate explanations inside beautiful cards.

------------------------------------

10. SETTINGS PAGE

------------------------------------

Theme Toggle

Notification Settings

API Settings

User Profile

Logout

------------------------------------

SIDEBAR

------------------------------------

Dashboard

New Application

Applicants

Analytics

Fraud Monitor

AI Decision

Settings

------------------------------------

TOP NAVBAR

------------------------------------

Search

Notifications

Profile

Dark Mode Toggle

------------------------------------

COMPONENTS

------------------------------------

Use reusable components.

Professional tables.

Loading skeletons.

Toast notifications.

Animated cards.

Hover effects.

Responsive charts.

Beautiful badges.

Status chips.

Progress bars.

Modern fintech icons.

------------------------------------

DESIGN

------------------------------------

Premium enterprise banking UI.

Rounded cards.

Subtle shadows.

Blue gradients.

Professional typography.

Responsive for desktop and mobile.

Smooth transitions.

------------------------------------

DUMMY DATA

------------------------------------

Generate around 250 realistic loan applicants.

Use realistic Indian names.

Credit Scores

Income

Loan Amount

Risk Level

Fraud Score

Approval Status

Alternative Data

Employment Details

Use dummy data throughout the application until backend APIs are connected.

------------------------------------

TECH STACK

------------------------------------

React

TypeScript

Tailwind CSS

shadcn/ui

React Router

Recharts

Lucide Icons

Framer Motion

React Hook Form

Zod Validation

TanStack Table

TanStack Query

------------------------------------

CODE REQUIREMENTS

------------------------------------

Create a modular folder structure.

Create reusable components.

Separate pages.

Use mock API services.

Keep the code production-ready.

The backend APIs will be integrated later, so every page should consume mock data from a central mock service.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://prime-credit-aid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6409e0c4-c56b-4f05-9b35-0d6bca05a3b1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
