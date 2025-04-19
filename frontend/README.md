# Tariff Copilot

An AI-driven dashboard for trade optimization, helping businesses navigate complex international trade regulations and optimize their supply chains.

## Features

- **Initial Setup**
  - Product catalog management (HS codes, descriptions)
  - Import/export country configuration
  - Supply chain information (vendors, ports, 3PLs)
  - Cost structure management (COGS, margins, duties)

- **Agent Dashboard**
  - Tariff Monitoring Agent: Real-time alerts and plain English summaries
  - Cost Impact Modeling Agent: Simulation tools and visualizations
  - Supply Chain Diversification Agent: Alternative supplier suggestions
  - Action Agent: Pre-filled forms and automated communications
  - Business Strategy Advisor: Scenario planning and recommendations

- **Integrations**
  - Email (Gmail/Outlook)
  - Communication (Slack)
  - Documentation (Notion)
  - Spreadsheets (Google Sheets)
  - ERP Systems (NetSuite, Zoho)

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Radix UI

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tariff-copilot.git
   cd tariff-copilot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── ...          # Feature-specific components
├── lib/             # Utility functions and hooks
└── styles/          # Global styles and Tailwind config
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
