# Planning Guide

A comprehensive tokenized business ecosystem platform that provides zero-cost infrastructure for creating, managing, and trading business tokens - designed to scale into a global economy where every business has its own currency backed by the Infinity framework. Features USD-to-INF token sales, live blockchain integration with real exchanges, automated repository management with one-click deploy, AI-powered page repair with image upload capabilities, continuous page health monitoring that auto-fixes design issues, real-time value tracking based on user engagement metrics, earning opportunities, racing game-style auto-pilot controls, comprehensive auction analytics with AI-powered market forecasting, batch automation system, live website manager that links directly to deployed pages (not GitHub repos), and safety-first UX that protects non-technical users while empowering advanced users. No API keys required - everything runs through authenticated user sessions.

**Experience Qualities**:
1. **Safe & Protective** - Users are shielded from technical complexity with explicit safety promises, safe mode toggle, background AI guardian notifications, plain-language interfaces, welcome flow, and "help me choose" dialogs - never asked for secret keys, API tokens, terminal commands, or confusing code
2. **Empowering & Autonomous** - Racing game-style auto-pilot system with granular batch automation lets users shift between manual control and automation for auctions, trading, pricing, analytics, and more - like shifting gears in a race car, users can automate entire workflows or take control for specific tasks. Live blockchain trading with real price feeds and exchange connectivity.
3. **Comprehensive & Transparent** - Complete analytics dashboards with AI market forecasting, real-time metrics, predictive recommendations, intent-based navigation, continuous page health monitoring that auto-fixes design issues, and human-friendly labels ("Create" not "Mint", "Publish" not "Deploy") make complex operations accessible to everyone

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-feature ecosystem platform integrating user authentication, token minting, real-time value tracking, USD token sales, comprehensive module registry, AI capabilities with predictive analytics, search, visualization, persistent session management, racing-style automation controls with batch processing, comprehensive auction analytics with market forecasting, welcome flow personalization, and safety-first UX that translates complex systems into human cognition.

## Essential Features

**Safety Promise & Trust Building**
- Functionality: Prominent safety promise displayed at the top of every page stating users will never be asked for secret keys, terminal commands, or code - if something can be done safely, it will be done for them
- Purpose: Immediately lower anxiety for non-technical users, establish trust before any interaction, and differentiate from technical platforms that expect users to adapt to software complexity
- Trigger: Automatically visible on page load in header area
- Progression: User lands on page → Sees green shield icon with safety promise card → Reads explicit guarantee about no technical requirements → Feels safe to explore → AI Guardian notification appears confirming protection → Footer reinforces "no action can break computer or cost money" → User confidently navigates knowing system protects them
- Success criteria: Safety promise visible above fold, uses friendly green color scheme with shield icon, text is plain-language without jargon, promise persists across sessions, users report feeling safer in feedback, bounce rate decreases for non-technical users

**Safe Mode Toggle**
- Functionality: Prominent toggle switch that enables/disables safe mode - when ON, hides advanced options, prevents irreversible actions, and disables anything involving money, deployment, or publishing until user explicitly disables safe mode
- Purpose: Protect parents, kids, tired users, and stressed users from making mistakes by creating a protective buffer layer - tells users "the system is protecting me" and allows confident exploration without fear
- Trigger: Toggle visible in header area below safety promise, defaults to ON for new users
- Progression: User sees "🔒 Safe Mode (On)" toggle → Advanced tabs like Deploy, Admin, Buy INF are hidden or preview-only → Destructive actions show explanations instead of executing → User gains confidence → When ready, user disables safe mode → Toast notification warns about increased access → All features become available → User can re-enable anytime
- Success criteria: Toggle persists across sessions using useKV, safe mode ON hides minimum 6 advanced features, shows clear "What happens next" previews for hidden actions, toast notifications confirm state changes, mobile-responsive design, color-coded states (green=safe, yellow=unlocked), users report feeling protected

**Racing Game Auto-Pilot Control System**
- Functionality: Sega-style racing game interface for automation control with 6 sections (Auctions, Trading, Pricing, Redistribution, Analytics, Quality Scoring) - each can be toggled between auto-pilot (AI controlled) and manual mode with 1-8 hour "shift" timers for temporary manual control
- Purpose: Give users the thrill and mental model of a racing game where they shift gears between manual and automatic transmission - empowers users to automate complex tasks while maintaining control, creates engaging gamified experience, and allows users to "take the wheel" when they want hands-on control
- Trigger: Navigate to Auto-Pilot tab in main navigation
- Progression: User opens Auto-Pilot Control Center → Sees 6 automation sections with toggle switches → Each section shows current state (Robot icon=auto, User icon=manual) → User enables auto-pilot for desired sections (e.g., Auctions, Trading) → For active auto-pilot, user can set "manual shift" timer (1h, 2h, 4h, 8h buttons) → During manual shift, badge shows countdown timer → AI operations pause for that section → User performs manual operations → Timer expires, auto-pilot automatically resumes → Global speed slider controls automation intensity (10-100% throttle) → Race Mode toggle adds visual flourish and faster operations → Dashboard shows real-time counts of auto vs manual sections
- Success criteria: All 6 sections independently toggleable, manual shift timers persist and countdown in real-time, auto-pilot operations actually pause during manual shifts, global speed slider affects operation frequency, race mode adds performance boost, visual feedback with icons and badges, statistics dashboard updates live, mobile-responsive with touch-friendly buttons, smooth animations for state changes, toast notifications for all mode changes

**Comprehensive Auction Analytics Dashboard with AI Forecasting**
- Functionality: Real-time analytics dashboard showing auction performance metrics including total volume, active/ended auctions, unique bidders, average duration, volume charts, performance trends, status distribution pie charts, and AI-generated market forecasts with predictive analytics - forecast includes next 24h volume, next 7d volume, confidence level, market trend (up/down/stable), and actionable recommendations
- Purpose: Provide transparent, data-driven insights into auction ecosystem health and performance with predictive capabilities - help users optimize auction strategies, understand market dynamics, forecast future trends, and make informed decisions about pricing and timing based on AI analysis
- Trigger: Navigate to Auction Data tab in main navigation
- Progression: User opens dashboard → Selects time range (24h, 7d, 30d, All) → Metrics calculate from auction history → 4 stat cards show key numbers (volume, total auctions, unique bidders, avg duration) → Volume bar chart shows top 10 auctions by final bid → Performance area chart shows trends over time (volume, bids, views) → Status pie chart shows active vs ended distribution → User clicks "Generate Forecast" button → AI analyzes recent 30 auctions, volume history, bid patterns → LLM generates JSON forecast with predictions → Forecast cards display next day/week volume predictions → Confidence meter shows AI certainty → Trend badge indicates market direction → Recommendation text provides actionable advice → All data updates in real-time as new auctions complete
- Success criteria: Metrics calculate in under 1 second, AI forecast generates in under 5 seconds, supports filtering by time range, visualizations use recharts library, color-coded with meaningful palette, AI insights provide actionable recommendations (100 char max), forecast confidence tracked, mobile-responsive layout, all charts animated, handles empty state gracefully, data persists and accumulates over time, forecast uses GPT-4o for accuracy

**Batch Automation System**
- Functionality: Comprehensive batch job automation system with 6 configurable jobs (Auto-Create Auctions, Auto-Price Optimization, Auto-Trade Stale Tokens, Auto-Redistribute Rewards, Auto-Backup Data, Auto-Analyze Repos) - each with independent enable/disable toggle, frequency control (1h, 6h, 12h, 24h, weekly), master switch to pause all jobs, and global processing speed slider (0-100%)
- Purpose: Enable "set it and forget it" automation for repetitive tasks while maintaining full control - like a racing game's auto-pilot but for multiple systems simultaneously, allows users to automate entire workflows and let the system run 24/7 or pause/adjust individual components as needed
- Trigger: Navigate to Batch Auto tab in main navigation
- Progression: User opens Batch Automation → Sees master switch (defaults OFF) → Views 6 job cards with descriptions → User enables desired jobs (e.g., Auto-Create Auctions, Auto-Price) → Sets frequency for each job using hour buttons → Adjusts global processing speed slider (conservative to aggressive) → Enables master switch → All enabled jobs begin scheduling → Dashboard shows active jobs count → Each job calculates next run time → Jobs execute automatically on schedule → User can pause individual jobs or entire system via master switch → Toast notifications confirm all state changes
- Success criteria: Master switch controls all jobs simultaneously, 6 independent job configurations, frequency options (1, 6, 12, 24, 168 hours), global speed slider affects processing intensity, job states persist using useKV, next run times calculate correctly, visual indicators for enabled vs disabled jobs, statistics show active/total jobs ratio, mobile-responsive design, smooth animations, clear help text explaining automation concept, works like racing game gear shifting metaphor

**Welcome Flow with Intent Detection**
- Functionality: First-visit dialog that appears after 1 second delay asking users to choose their primary intent: Build (create tokens/auctions/apps), Learn (understand how system works), or Explore (browse markets/opportunities) - selection routes user to appropriate starting point and sets preference flag so dialog doesn't reappear
- Purpose: Personalize the initial experience by understanding user motivation and routing them to relevant features first - reduces cognitive load of seeing all 36 tabs at once, prevents new users from feeling overwhelmed, and establishes that the system adapts to humans rather than forcing humans to adapt to software
- Trigger: Automatic on first visit after 1 second delay, uses useKV to track "has-seen-welcome" flag
- Progression: User lands on site for first time → 1 second passes → Welcome dialog animates in → Shows 3 large intent cards (Build, Learn, Explore) with icons and descriptions → User clicks intent card → Dialog closes with animation → User navigates to appropriate starting tab (Build→tokens, Learn→home, Explore→markets) → has-seen-welcome flag set to true → Dialog never shows again → User can still access all features regardless of choice
- Success criteria: Dialog shows only once per user, 1 second delay before appearing, 3 clear intent options with icons, smooth entry/exit animations, routes to logical starting points, sets persistent flag, mobile-responsive with large touch targets, can be dismissed to set flag without choosing, reassuring message that choice doesn't limit access to other features, uses Sparkle icon and accent colors

**Help Me Choose Contextual Assistant**
- Functionality: Small "Help me choose" button with sparkle icon that appears in sections with multiple options (tokens, marketplace, auction tabs) - opens dialog asking 1-2 plain language questions then automatically routes user to correct destination based on answers
- Purpose: Prevent users from guessing wrong and feeling dumb when faced with similar-sounding options - provides a non-technical fork in the decision tree that asks human-friendly questions rather than assuming users understand the differences between "mint", "trade", "auction", etc.
- Trigger: Button visible in top-right of relevant tab content areas (tokens, marketplace, auction, general navigation)
- Progression: User sees multiple related options and feels uncertain → Clicks "Help me choose" button → Dialog opens with category-specific title → Shows 4 options as cards with questions and answers → User clicks desired option card → Dialog closes → User navigates to correct tab → Arrives at intended destination without trial-and-error
- Success criteria: 4 categories implemented (tokens, marketplace, auction, general), each with 4 destination options, plain-language questions (not jargon), smooth animations on card hover, instant navigation on selection, dialog responsive on mobile, button styled with accent colors, sparkle icon for discoverability, reassuring help text at bottom of dialog

**Intent-Based Helper Dialog**
- Functionality: Floating "Help me choose" button that opens dialog asking user's intent (Build, Learn, Trade, Automate) then routes them to the appropriate section with plain-language choices
- Trigger: Floating button in bottom-right, always visible
- Progression: User clicks "Help me choose" → Dialog opens with 4 intent cards → User selects intent (e.g., "Trade & Earn") → Shows 3 destination options relevant to that intent with clear labels → User clicks destination → Navigates to correct tab → Dialog closes → User lands in right place without guessing
- Success criteria: Button visible on all pages, dialog mobile-friendly, 4 intent categories with 3 destinations each, smooth navigation, prevents users from feeling lost, reduces incorrect tab clicks, animated transitions

**AI Guardian Notification**
- Functionality: Fixed notification card in top-right showing AI is watching for mistakes and will stop to explain if something looks unsafe or confusing
- Purpose: Frame AI as guardian, translator, and buffer between human and system - not a black box but a protective presence that prevents errors
- Trigger: Appears automatically on page load, persists while browsing
- Progression: User lands on page → AI Guardian card fades in → Shows robot icon with pulse animation → Message explains AI protection → User feels reassured → Card stays visible but unobtrusive → If user attempts risky action, AI can show warning
- Success criteria: Card positioned top-right without blocking content, uses friendly blue/purple gradient, robot icon pulses subtly, dismissible but reappears on next session, mobile-responsive positioning, text is reassuring not threatening

**Safety Footer**
- Functionality: Footer bar at bottom of every page stating "No action here can break your computer, steal your account, or cost money without clear confirmation"
- Purpose: Final reassurance that reinforces trust and safety - addresses common fears that prevent non-technical users from exploring
- Trigger: Always visible at bottom of page
- Progression: User scrolls to bottom → Sees shield icon and safety statement → Feels final layer of confidence → Can explore features without fear
- Success criteria: Always at page bottom, uses shield icon, bold text for key message, persists across all tabs, mobile-responsive

**Human-Friendly Tab Labels**
- Functionality: Tab labels redesigned to use plain language that expresses intent rather than technical jargon - "Create" instead of "Builder", "Do Many" instead of "Batch", "Take With Me" instead of "Export", "Publish" instead of "Deploy", "My Controls" instead of "Admin", "Add Abilities" instead of "Modules", "Create Value" instead of "Mint", "Recognize" instead of "Scanner"
- Purpose: Reduce cognitive load by using language non-technical users understand - enables users to point and say "that makes sense" without asking for help
- Trigger: Visible in all tab navigation
- Progression: User scans tab bar → Sees familiar, intent-based words → Understands what each tab does without hovering or clicking → Confidently navigates to desired location → Reduces analysis paralysis
- Success criteria: All 36+ tabs use human-friendly labels, maintains consistency in phrasing, preserves iconography for visual learners, no technical acronyms or jargon, user testing shows improved comprehension

## Essential Features

**Token Redistribution Notification System**
- Functionality: Proactive alert system that monitors token holder activity and sends escalating warnings before inactive tokens are automatically redistributed to active traders
- Purpose: Give token holders fair warning and multiple opportunities to maintain ownership by recording activity, preventing surprise token loss and ensuring the redistribution system is transparent and user-friendly
- Trigger: Navigate to Alerts tab to view and manage notifications, or receive automatic push notifications
- Progression: Background service checks all token holdings every hour → Calculates days remaining before 30-day inactivity threshold → Generates warnings at configurable thresholds (default: 7 days, 3 days, 1 day) → User receives browser notification with urgency level → Alerts tab shows all active warnings color-coded by severity (Safe: green 8+ days, Warning: yellow 4-7 days, Critical: orange 2-3 days, Imminent: red <24 hours) → Each warning displays token symbol, amount, countdown timer, progress bar, and last activity date → User clicks "Record Activity" button to reset 30-day timer → Alternatively can dismiss warnings temporarily → Notification settings allow customization of warning thresholds and enable/disable push notifications → Redistribution History tab shows complete audit trail of all past redistributions with from/to owners, amounts, timestamps, and reasons → Statistics show total redistributions, tokens received, and tokens lost
- Success criteria: Warnings generated automatically at correct thresholds, browser push notifications trigger for critical alerts (3 days or less), notifications display with proper urgency colors and icons, countdown timers update in real-time showing hours when <1 day, "Record Activity" button successfully resets lastActivity timestamp to current time, warnings disappear after activity recorded, dismissed warnings don't re-appear until next threshold, notification settings persist and apply correctly, redistribution history persists permanently with complete audit trail, statistics calculate accurately, service runs in background without user interaction, mobile-responsive notification cards, no duplicate notifications sent, redistribution service finds active traders by analyzing transaction history, tokens redistribute fairly to most active users, previous owners tracked in token metadata

**Automatic Token Redistribution System**
- Functionality: Monitors token holder activity and automatically transfers tokens from inactive/dormant holders to the most active traders, keeping tokens in circulation and rewarding engagement
- Purpose: Prevent token hoarding, ensure liquidity, and incentivize active participation in the token economy by redistributing stagnant tokens to engaged users
- Trigger: Navigate to Activity tab → Configure redistribution settings → Enable auto-redistribution
- Progression: System scans all token holders → Calculates days since last activity for each holder → Classifies holders as active (<30 days), inactive (30-90 days), or dormant (>90 days) → On configured interval (default 24 hours), system identifies inactive/dormant holders → Calculates redistribution amount (configurable percentage, default 25%) → Identifies top active traders by activity score → Distributes tokens from inactive holders to active traders → Records all transfers with timestamp and reason → Updates holder balances automatically → Dashboard displays real-time stats (total holders, active/inactive/dormant counts, tokens redistributed, transfer history) → Manual scan and redistribution available anytime → Transfer history shows all redistributions with from/to users, amounts, and reasons
- Success criteria: Activity scanning completes in under 5 seconds, holder classification accurate based on last activity timestamp, redistribution runs automatically at configured interval, configurable thresholds (inactivity 7-90 days, dormancy 30-365 days), configurable redistribution percentage (5-50%), configurable number of target traders (1-100), all transfers recorded with full audit trail, balances updated atomically, no duplicate transfers, system can be enabled/disabled with toggle, manual redistribution available, transfer history persists permanently, holder status view shows all tokens with activity badges, real-time statistics update after each scan, reset system clears transfer history without affecting balances

**Page Health Monitor & Auto-Fix System**
- Functionality: Continuous background monitoring system that scans the entire page every 5 seconds for design issues (text overflow, broken buttons, layout shifts, zero-dimension elements, parent overflow) and automatically fixes detected problems with CSS adjustments
- Purpose: Keep the page running smoothly without any user intervention - ensures text never gets cut off, buttons remain clickable, layouts stay stable, and design issues are caught and corrected before users notice them
- Trigger: Navigate to Page Health tab to view real-time monitoring dashboard, or monitoring runs silently in background
- Progression: User navigates to Page Health tab → Sees monitoring status (Active/Paused) with toggle → Dashboard shows 3 stat cards (Issues Fixed count, Active Issues count, Monitor Status) → If issues detected, scrollable list appears showing each issue with severity badge (high/medium/low), element identifier, description, and "Fix" button → User clicks "Fix All" button to auto-fix all issues at once → Each issue applies appropriate CSS (overflow:hidden for text overflow, display:inline-flex for broken buttons, max-width:100% for layout shifts) → Issue disappears from list after successful fix → Fixed count increments → When no issues, green "All Systems Healthy" card displays → Monitoring runs continuously every 5 seconds scanning all interactive elements and text containers → Auto-fixes apply without page reload → Toast notifications confirm each fix
- Success criteria: Monitoring runs every 5 seconds without performance impact, detects text overflow when scrollWidth > clientWidth, detects broken buttons when offsetWidth/Height = 0, detects layout shifts when element exceeds parent bounds, auto-fix applies correct CSS properties, issues removed from list after fix, fixed count persists during session, monitoring can be paused/resumed with toggle, no false positives in issue detection, mobile-responsive dashboard, smooth animations for issue cards, supports viewing 10 most recent issues, clear severity color coding (red=high, yellow=medium, blue=low)

**AI Page Repair Studio with Image Upload**
- Functionality: Comprehensive AI-powered page repair system with screenshot upload capabilities, automatic issue detection, natural language repair requests, and direct GitHub commit integration - uses Bill Gates' best computer vision technology to read UI screenshots and automatically fix design problems
- Purpose: Enable users to fix website issues by simply uploading screenshots or describing problems in plain English - AI analyzes visual issues, generates specific changes, applies fixes, and commits everything to GitHub automatically without requiring any code knowledge
- Trigger: Navigate to "AI Repair" tab in main navigation
- Progression: User opens AI Repair Studio → Uploads 1+ screenshots showing visual problems (text overlaps, alignment issues, broken buttons) → Or describes issues in textarea ("repo link should go to live page not GitHub repo", "words are written over each other in nav") → Clicks "AI Repair Page" button → AI analyzes screenshots using computer vision → Identifies specific issues (overflow, alignment, broken links, script errors, layout problems) → Generates 3-5 specific changes needed → Displays issues with severity badges and element identifiers → User can fix individual issues or click "Fix All" → Each fix applies CSS/HTML changes → Changes committed to GitHub with descriptive messages → Deployed automatically to live site → Repair session saved to history with screenshots, changes, and timestamps → History tab shows all past repairs for reference
- Success criteria: Image upload supports multiple formats (PNG, JPG, GIF), AI analyzes screenshots in under 5 seconds using GPT-4o, identifies 5 common issue types (overflow, alignment, broken-button, script-error, layout), natural language requests parsed correctly, fixes apply appropriate CSS properties, each repair commits to GitHub (simulated), toast notifications confirm each step, repair sessions persist permanently, history shows thumbnails of uploaded screenshots, mobile-responsive interface with touch-friendly upload area, "Fix All" batch processes all issues sequentially with progress indication, Bill Gates vision technology branding displayed prominently

**Live Website Manager**
- Functionality: Unified interface showing all pewpi-infinity GitHub repositories with direct links to live deployed websites (GitHub Pages URLs), visual cards with status badges, one-click "View Live" buttons, edit/repair interfaces, and automatic scanning for repos with index.html files
- Purpose: Replace confusing GitHub repo links with direct access to live websites - users click once to see the actual deployed page, not the code repository, making it obvious which sites are live and ready to work on
- Trigger: Navigate to "Live Websites" tab in main navigation, or accessible from "My Repos" tab with "View Live" buttons
- Progression: User opens Live Websites tab → Sees "Scan All Repos" button → Clicks to discover all pewpi-infinity repositories → System scans for repos with GitHub Pages enabled and index.html files → Displays cards showing repo name, description, live URL (pewpi-infinity.github.io/reponame/), and status badge (live/broken/needs-repair) → Each card has "View Live" button that opens actual website in new tab → "Edit" button opens AI Page Repair interface for that specific site → "Repair" button for quick fixes → Search bar filters by name/description → All URLs point to live pages (*.github.io/*) not GitHub repo URLs (github.com/*) → Status automatically detected by checking if page loads successfully
- Success criteria: Scans minimum 3 repositories from pewpi-infinity organization, displays live URLs in format https://pewpi-infinity.github.io/reponame/, "View Live" buttons open websites in new tabs, status badges color-coded (green=live, red=broken, yellow=needs-repair), search filters repos in real-time, edit integration opens AI Page Repair with repo context, no GitHub repo URLs shown to users (only live website links), smug_look repo featured prominently with correct live URL, mobile-responsive cards with touch-friendly buttons

**Continuous Page Monitor (Background Process)**
- Functionality: Silent background process that runs every 5 seconds automatically fixing common design issues without user intervention - fixes text overflow, alignment problems, overlapping text, broken buttons, and inconsistent spacing
- Purpose: Act as a "design immune system" that constantly repairs the page while users browse - prevents visual bugs from accumulating, keeps layouts stable, ensures buttons remain clickable, and maintains consistent spacing without any manual action required
- Trigger: Automatically starts on page load, runs continuously in background
- Progression: Page loads → ContinuousPageMonitor component mounts → Scans all DOM elements for common issues → Fixes text overflow by applying overflow:hidden and text-overflow:ellipsis → Aligns flex container children → Detects overlapping text elements and adds z-index separation → Ensures buttons have minimum dimensions (2rem × 2rem) → Fixes inconsistent spacing between sections → Repeats scan every 5 seconds → All fixes apply instantly without page reload → No UI feedback unless issues detected in Page Health tab → Works invisibly maintaining page quality
- Success criteria: Runs without performance degradation, fixes apply within 100ms of detection, no conflicts with user CSS, handles dynamic content added after initial load, scans complete in under 50ms, fixes persist until next scan cycle, doesn't interfere with animations or transitions, mobile-responsive fixes don't break desktop layouts

**Repository Management Hub with One-Click Deploy**
- Functionality: Unified interface showing all pewpi-infinity GitHub repositories in a visual list with form-based editing (no code required), intelligent scanning with natural language queries, batch operations, and one-click deploy that creates repo + generates files + deploys to live website + tokenizes and protects - all automated
- Purpose: Eliminate the need for users to navigate GitHub's complex interface, understand repository structures, or use terminal commands - edit repos like eBay listings with simple form fields, deploy entire projects with a single button that handles everything from creation to live website
- Trigger: Navigate to "My Repos" tab to access repository management
- Progression: User opens My Repos tab → Sees all pewpi-infinity repositories loaded automatically (mock data or real GitHub API) → Each repo card shows folder icon, name, description, language badge, star count, topics, and action buttons → User clicks "Edit" button → Dialog opens with form fields (Repository Name, Description, README Content, Visibility, License, Homepage URL) each with "?" help button explaining the field → User edits fields like a form submission → Clicks "Save Changes" → Repository updates (simulated) → Toast confirms success → User clicks "Scan" button → Dialog asks "What would you like to scan for?" with text input and quick buttons (Quality, Security, Components, Dependencies) → User types natural language query or clicks button → AI scans repository content and provides insights → User clicks "Deploy" button → Multi-step deployment begins with toast notifications: "Creating repository structure" → "Generating files and indexes" → "Deploying to live website" → "Tokenizing and protecting" → Final toast with "View Live Site" action button → User clicks "Add" to add repo to project collection for batch operations → Search bar filters repos by name, description, or topics → Refresh button reloads repository list → All operations work without user providing API keys
- Success criteria: Displays minimum 3 repositories from pewpi-infinity, each repo card shows all metadata, edit dialog has 6+ editable fields with help tooltips, form-based editing (no code shown to user), scan feature accepts natural language queries, AI-powered scan returns 3-5 actionable insights, one-click deploy shows 4 sequential progress stages with 1-2 second delays, deploy generates mock live URL in format reponame.infinity.app, add to project button updates UI state, search filters repos in real-time, all operations simulated without requiring real API keys, mobile-responsive cards and dialogs, smooth animations for state changes, toast notifications for all actions, supports batch selection for multi-repo operations

**Live Blockchain Integration with Real Trading**
- Functionality: Real-time blockchain connection system with live price feeds updating every 5 seconds, multi-network wallet support (Ethereum, Polygon, Binance, Solana), manual and automated trading with simulated or real exchanges, complete trade history, and auto-trading AI that monitors prices and executes trades automatically
- Purpose: Remove all API fee barriers by simulating blockchain operations while providing the exact UX and functionality of real exchanges - users can practice trading, test strategies, and see live price movements without risking real money, with clear path to connect real exchanges when ready
- Trigger: Navigate to "Live Blockchain" tab to access trading interface
- Progression: User opens Blockchain tab → Sees "Live Prices" tab with 5 tokens (INF, ETH, BTC, SOL, MATIC) showing current price, 24h change percentage with trend arrow, 24h volume, and Buy/Sell buttons → Prices update automatically every 5 seconds with realistic random fluctuations ±2% → User clicks "Buy 1" or "Sell 1" → Trade executes immediately with pending status → After 2 seconds, trade completes and appears in History tab → User navigates to "Wallets" tab → Clicks "Connect Ethereum/Polygon/Binance/Solana" buttons → Simulated wallet connection generates mock address and shows in connected list with network badge → User can disconnect wallets anytime → User navigates to "Trade" tab → Selects exchange (Simulated, Uniswap, PancakeSwap, Raydium) → If simulated, yellow banner explains demo mode → Grid shows quick-trade buttons for each token → User navigates to "History" tab → Scrollable list shows all trades with type badge (BUY/SELL), token amount, price, timestamp, and status badge (pending/completed/failed) → Auto-trade toggle in header enables AI trading → When enabled, toast confirms "AI will monitor prices and execute trades automatically" → All operations work without API keys or real funds → Clear indication when using simulated vs real mode
- Success criteria: 5 tokens displayed with live prices, prices update every 5 seconds, realistic ±2% price fluctuations, 24h change shows positive/negative with colored trend arrows, volume displayed in millions format, Buy/Sell buttons execute trades instantly, pending trades show for 2 seconds before completing, 4 blockchain networks supported for wallet connection, wallet addresses shown in truncated format (0x...1234), connected wallets display with colored network badges, 4 exchange options in dropdown, simulated mode shows warning banner, trade grid shows 4 tokens with quick-trade buttons, trade history persists using useKV, history shows all trade details with status badges, auto-trade toggle works and shows confirmation toast, all trades recorded with timestamp and full details, supports filtering trade history by token/type, mobile-responsive layout with touch-friendly buttons, smooth animations for price updates and trade executions, no real API connections required until user explicitly chooses real exchange

**Background AI Guardian with Triggered Alerts**
- Functionality: Subtle, dismissible AI presence that appears briefly on first visit then stays hidden in the background, monitoring user actions and only appearing as a small notification when it detects something potentially unsafe or confusing that warrants intervention
- Purpose: Provide protective AI oversight without constant visual noise - let users explore freely while knowing AI is watching for mistakes, only interrupting when truly necessary to prevent errors or explain complex actions
- Trigger: Automatically appears on first visit for 5 seconds, can be manually dismissed, reappears when triggered by risky actions
- Progression: User lands on page for first time → After 2 seconds, small card fades in top-right corner → Shows minimal text "Infinity AI is watching for mistakes" with robot icon → Auto-dismisses after 5 seconds → User can click X button to dismiss manually → Dismissal saves to useKV so card doesn't reappear → AI monitors in background for risky patterns (large financial transactions, irreversible deployments, data deletions) → When risky action detected, card reappears with specific alert message → User reads warning and can proceed or cancel → Card dismisses after alert acknowledged → Background monitoring continues throughout session → Subtle, semi-transparent design doesn't block content → Mobile-responsive positioning
- Success criteria: Card appears 2 seconds after first page load, displays for 5 seconds then fades out, dismiss button saves preference to useKV, dismissed state persists across sessions, card has semi-transparent background with backdrop blur, positioned top-right without blocking primary content, robot icon with reduced opacity for subtlety, alert messages specific to detected risk, reappears only when triggered not on timer, mobile positioning adjusts to avoid nav/header overlap, smooth fade in/out animations, text concise (under 15 words), uses calming blue/purple colors, no intrusive animations or flashing

**Real-Time Token Metrics & Value System**
- Functionality: Comprehensive engagement tracking system that measures every user interaction with tokens (clicks, views, transfers, bids, trades) and automatically calculates real-time token values based on actual usage metrics
- Purpose: Provide transparent, verifiable token valuation based on genuine user engagement rather than speculation - creating a fair value system where tokens gain worth through real utility and community interaction
- Trigger: All token interactions automatically tracked; view analytics on dedicated Metrics tab
- Progression: User interacts with token (click, view, transfer, bid, trade) → Metric recorded with timestamp and user ID → Value calculation triggered → Token snapshot updated → Historical data preserved → Dashboard displays real-time value with breakdown → Charts show value growth over time → Users can click tokens to directly increase value → Network effect multiplier applied based on active users → Engagement multiplier rewards sustained activity
- Success criteria: All interactions tracked accurately, values update in real-time (30s refresh), historical charts display growth trends, metric breakdowns show contribution by type, transparent calculation formulas visible, network effect multiplier scales with users, engagement multiplier rewards activity, auction pages show real token values, click-to-increase-value feature functional, mobile-responsive analytics dashboard, all data persists permanently, supports unlimited tokens

**Live Auction Viewer with Real-Time Metrics**
- Functionality: Enhanced auction interface showing real-time token values based on engagement metrics alongside bid prices, with USD/INF bidding, expandable details, and automatic value tracking
- Purpose: Enable transparent token auctions where bidders can see both the current bid price and the underlying real value based on actual token engagement - building trust through data-driven valuations
- Trigger: Navigate to Auction tab to see live auctions
- Progression: User browses active auctions → Sees token symbol, current bid, and real-time value from metrics → Views click count, view count, transfers, active users → Clicks auction to expand details → Sees detailed metrics breakdown (base value + metrics value) → Places bid in INF or USD → Bid tracked as metric, increasing token value → Real-time updates show new bids and value changes → Historical bid list shows all bidders → Winner determined at auction end → Ended auctions archived with final metrics
- Success criteria: Auctions display both bid price and real token value, metrics update in real-time during bidding, bidding tracked and increases token value, USD and INF currencies supported, expandable details show full analytics, bid history visible, time remaining countdown accurate, winner notification system, PayPal integration for USD bids, mobile-responsive interface, all data persists

**Infinity Token Sale & USD Payment System**
- Functionality: Complete USD-to-INF token purchasing system with pre-configured packages and custom amounts, plus earning opportunities through contributions
- Purpose: Enable users to buy Infinity tokens with real USD currency during beta program, or earn them through development, research, and ecosystem contributions - preparing for Summer 2026 major distribution event
- Trigger: Navigate to Buy INF tab
- Progression: User selects from pre-configured token packages (Starter, Growth, Pro, Enterprise, Whale) with bonus percentages → Or enters custom USD amount → Selects payment method (PayPal, Venmo, Bank Transfer) → Submits purchase request → OR switches to Earn tab → Enters requested INF amount → Describes contribution/work performed → Submits earn request → Requests tracked with pending/approved/rejected status → Upon approval, INF tokens automatically added to user balance → All requests logged permanently with timestamps
- Success criteria: Multiple package options available with bonus incentives (10-35% bonus on larger packages), custom USD amounts supported, rate calculation shows INF received ($0.10 per INF base rate), earn requests support detailed justifications, all purchase and earn requests tracked by status, approved requests automatically credit INF tokens, payment methods captured for processing, beta program badge displayed, Summer 2026 giveaway information prominent, request history persistent across sessions, mobile-responsive interface

**GitHub Research Repository Auto-Import**
- Functionality: Automated system for importing GitHub repositories as verified research tokens with cryptographic hash generation, README parsing, and value calculation based on repository metrics
- Purpose: Enable developers and researchers to instantly convert their open-source contributions into tokenized research assets with verified provenance, creating a bridge between code repositories and the research token economy
- Trigger: Navigate to Research tab → Auto-Import tab
- Progression: User enters GitHub username to discover all public repos OR enters specific repository URL → System fetches repository metadata (stars, forks, language, size) → User selects repositories to import → Clicks "Import" button → System fetches README content for each repo → Generates cryptographic SHA-256 content hash → Creates verification hash from metadata → Calculates token value based on README length, stars, forks, size, and language multipliers → Creates verified research token with "imported" flag → Token metadata includes repo details (language, stars, forks, size) → INF tokens automatically added to user wallet → Import progress bar shows completion status → Repository link preserved in token for traceability
- Success criteria: Username search discovers all public repositories instantly, specific URL import fetches single repository, README content parsed and included in token, cryptographic hashes generated for content and verification, value calculation applies correct multipliers (base 2000 INF + README bonuses + star/fork bonuses + language multipliers 1.2-2.0x), imported tokens flagged distinctly with repository metadata preserved, batch import supports multiple repositories simultaneously, progress indicator shows import status, all imported tokens persist with full GitHub traceability, mobile-responsive interface, GitHub API rate limits handled gracefully

**Silver-Backed Token Display**
- Functionality: Special showcase for tokens backed by real-world assets (silver bits)
- Purpose: Highlight premium tokens with tangible backing separate from research/ecosystem-backed tokens
- Trigger: Displays on Buy INF tab when silver tokens exist
- Progression: System detects tokens with "SILVER" symbol or name → Displays in dedicated section → Shows token details, supply, and backing information → Badge indicates "Silver Backed" status
- Success criteria: Silver tokens automatically identified and displayed, clear indication of real silver backing, separate from standard business tokens, elegant presentation matching premium nature

**Social Security Rapid Payment Distributor**
- Functionality: High-speed collision-aware bot spawning system for distributing trillion-dollar social security payments to millions of recipients across multiple service categories (housing, food, healthcare, security, infrastructure, veterans care)
- Purpose: Enable rapid, secure distribution of social security and government benefit payments at massive scale with full auditability and collision protection
- Trigger: Navigate to SS Pay tab
- Progression: User configures distribution parameters (total amount in trillions, recipient count in millions) → Toggles collision protection → Adjusts speed multiplier → Generates recipients across service categories → Spawns specialized payment bots for each service type → Clicks "Start Distribution" → Bots process payments in parallel with collision detection → Real-time progress tracking shows recipients paid, amounts distributed, completion percentage → Service-specific analytics display category breakdowns → All distributions logged permanently
- Success criteria: System handles millions of simulated recipients, bots spawn instantly with unique IDs, collision protection prevents duplicate payments, distribution completes with 100% accuracy, real-time stats update smoothly, service category breakdowns accurate, all payment history persists in storage, speed multiplier affects processing time, mobile-responsive interface

**User Authentication & Session Management**
- Functionality: GitHub-based login with persistent session tracking and user profiles
- Purpose: Enable personalized experiences and secure access to token minting and business features
- Trigger: Click login button or access protected features
- Progression: User clicks login → GitHub authentication → Session created with timestamp → Profile loaded/created → Token balances displayed → Activity tracked
- Success criteria: Sessions persist across refreshes, all login data saved permanently, user can logout and login again

**Business Token Minter**
- Functionality: Create custom business tokens backed by Infinity ecosystem with configurable supply
- Purpose: Enable businesses to mint their own currency for their logged-in pages within Infinity
- Trigger: Navigate to Tokens tab and fill in token details
- Progression: User enters business name → Token details (name/symbol) → Initial supply → Mint button → Token created and added to ecosystem → Balance updated in user profile → Transaction recorded in history
- Success criteria: Tokens persist permanently, display in user wallet, appear in ecosystem registry, backed by INF, mint transaction recorded

**Token Transfer System**
- Functionality: Transfer tokens between users with optional notes
- Purpose: Enable peer-to-peer token economy and facilitate business transactions
- Trigger: Navigate to Account tab → Transfer section
- Progression: User selects recipient from dropdown → Chooses token type → Enters amount → Adds optional note → Sends transfer → Balances update → Transaction recorded
- Success criteria: Transfers complete instantly, balances sync across users, transaction history persists, insufficient balance prevented

**Token Exchange Marketplace**
- Functionality: Decentralized marketplace for trading tokens with buy/sell order books and historical price charts
- Purpose: Create liquidity and enable price discovery for all business tokens in the ecosystem
- Trigger: Navigate to Market tab or Trade tab
- Progression: User selects token → Views interactive price chart with historical data → Analyzes market trends with candlestick or line charts → Views order book (buy/sell orders) → Creates buy or sell order with price and amount → Order placed in open order book → Other users fill orders → Trade executed instantly → Balances updated → Transaction recorded
- Success criteria: Real-time order book displays aggregated buy/sell orders, interactive D3 price charts show historical trends with multiple timeframes (1H, 24H, 7D, 30D, ALL), candlestick and line chart views available, users can create/cancel orders, trades execute instantly with proper balance validation, order history tracked per user, supports multiple token pairs trading against INF

**Token Auction System with USD Bidding**
- Functionality: Time-limited auctions for tokens with competitive bidding in both INF and USD currencies, shareable auction links, watch lists, and real-time outbid notifications
- Purpose: Enable price discovery through competitive bidding, create urgency and excitement around token sales, support both crypto (INF) and fiat (USD) currency bidding to maximize accessibility
- Trigger: Navigate to Auction tab → Create or bid on auctions
- Progression: User creates auction by selecting token → Sets amount, starting bid, optional reserve price → Chooses duration (hours) → Adds optional description → Auction goes live → Other users view active auctions → Users select bid currency (INF or USD) → Place bids higher than current bid → Real-time updates show new bids → Highest bidder displayed with crown icon → User receives notification if outbid → Auction ends when timer expires → Winner receives tokens, creator receives payment → USD bids flagged for manual payment confirmation → Users can share auction links externally → Add auctions to watch list for tracking without bidding → Auction templates available for recurring sales → Analytics dashboard tracks auction performance
- Success criteria: Auctions create successfully with all fields validated, countdown timers update in real-time, bids only accepted if higher than current bid, INF bids validate token balance before accepting, USD bids accepted with payment confirmation notice, outbid notifications trigger immediately with clickable action to re-bid, ended auctions show winner clearly, auction links are shareable and load correctly, watch list persists across sessions with notification badges, auction templates save configuration for reuse, analytics show total bids, unique bidders, final prices, and performance metrics, all auction data persists permanently, mobile-responsive interface with touch-friendly bidding

**Market Overview Dashboard**
- Functionality: Comprehensive view of all tokens with live pricing, mini sparkline charts, and market statistics
- Purpose: Provide at-a-glance market intelligence for the entire token ecosystem
- Trigger: Navigate to Markets tab
- Progression: User views dashboard → Sees top gainers and total market cap → Browses token list with live prices and sparklines → Sorts by market cap, price change, or volume → Clicks token to view detailed charts
- Success criteria: All tokens display with current price, 24h change percentage, volume data, mini sparkline charts render using D3, real-time sorting and filtering, smooth transitions between views

**Transaction History**
- Functionality: Comprehensive audit trail of all token transactions (mints, sends, receives)
- Purpose: Provide transparency and tracking for world currency system
- Trigger: Navigate to Account tab → History section
- Progression: View chronological list → Filter by type → See transaction details (amount, timestamp, parties, status, notes) → Track sent/received amounts
- Success criteria: All transactions permanently recorded, clear visual indicators for transaction type, sortable and filterable

**Module Registry & Browser**
- Functionality: Comprehensive catalog of all system modules with categories, dependencies, and capabilities
- Purpose: Track entire ecosystem from socket/chain to commerce to AI - every repo aware of its position
- Trigger: Navigate to Modules tab
- Progression: View all modules → Filter by category → Search capabilities → Select module → View details/dependencies/dependents → Understand ecosystem architecture
- Success criteria: All 50+ modules cataloged, searchable, categorized with visual hierarchy and dependency graphs

**AI Chat Assistant**
- Functionality: Personal AI chatbot that helps users build and search for what they need
- Purpose: Provide intelligent assistance and conversation to help users accomplish tasks
- Trigger: Click chat interface or type message
- Progression: User types query → AI processes with visual feedback → Response displays with rich formatting → Follow-up suggestions appear
- Success criteria: Responses are helpful, contextual, and display within 2 seconds

**Multi-Source Search Engine**
- Functionality: Search across Google and other sources with vector-based relevance and graph visualization
- Purpose: Find information intelligently using quantum-inspired vector search with visual result mapping
- Trigger: Enter search query in main search bar
- Progression: User enters search → Results fetch from multiple sources → Vector analysis ranks relevance → Graph visualization shows connections → Clickable results displayed
- Success criteria: Results appear within 3 seconds, graph shows relationships, results are relevant

**Data Visualization Dashboard**
- Functionality: Visual graphs and charts showing search patterns, AI usage, and data connections
- Purpose: Make information storage and retrieval visually understandable through mongoose-style data representation
- Trigger: Navigate to dashboard or after search completion
- Progression: User performs actions → Data aggregates → Charts/graphs update in real-time → Interactive elements allow drilling down
- Success criteria: Visualizations are clear, colorful, and update smoothly

**Slot Machine Mini-Game**
- Functionality: Working slot machine with spinning reels, win conditions, and visual effects
- Purpose: Add engaging entertainment element to the platform
- Trigger: Click slot machine section
- Progression: User clicks spin → Reels animate with visual effects → Results determine → Win/loss state shows → Credits update
- Success criteria: Smooth animations, clear win states, satisfying feedback

**Neural Page Generator (Slot Machine Enhanced)**
- Functionality: AI-powered page generation from user thoughts with expandable sections and neural cart storage
- Purpose: Enable users to rapidly prototype web pages by describing ideas, then grow content section-by-section
- Trigger: User enters thought/idea in the text area and clicks "Generate Page from Thought"
- Progression: User describes page idea → Clicks generate → Slot machine reels spin with icons → AI generates page structure with title, description, and 5 sections → User clicks section buttons to "grow" detailed content → Each section expands with AI-generated paragraphs → User saves complete page to Neural Cart → Pages persist and can be loaded later for further editing
- Success criteria: Pages generate within 3 seconds, sections grow on demand with relevant content, Neural Cart stores unlimited pages persistently, smooth reel animations provide satisfying feedback, users can reload and continue working on saved pages

**HTML Page Export System**
- Functionality: Export any page or all pages as standalone static HTML files with embedded styles for deployment
- Purpose: Enable users to deploy their generated pages to any hosting platform (GitHub Pages, Netlify, Vercel, etc.)
- Trigger: Navigate to Export tab
- Progression: User selects export options (include styles, scripts, standalone mode) → Names the export → Chooses to export current view, specific page, or all pages → System captures page HTML with styles → Downloads HTML files to device → Optional index.html generated for multi-page exports → Files ready for deployment
- Success criteria: Exports complete within seconds, HTML files are valid and self-contained, all styles preserved, files work on any hosting platform, export history tracked persistently, users can re-download previous exports

**Automated Platform Deployment**
- Functionality: One-click automated deployment to Netlify with comprehensive API token testing and validation, saved API configuration, plus deployment hubs for Vercel and GitHub Pages
- Purpose: Enable instant deployment of exported pages to production-grade hosting platforms without leaving Infinity Brain - true one-click deployment after initial setup with confidence through built-in connection testing
- Trigger: Navigate to Deploy tab → Deployment Hub
- Progression: User views platform comparison and features → Selects Netlify platform → Enters API token from Netlify settings → Clicks "Test Connection" button to validate token → System runs comprehensive 5-step validation (token format, API connection, permissions verification, account info check, site creation capability test) → Visual feedback shows each step's status with detailed messages → Token validation success confirms account details and permissions → User saves configuration persistently → Clicks "One-Click Deploy 🚀" button → Progress bar shows export/upload/deployment stages → Site automatically created and deployed to Netlify CDN → Deployment completes with live HTTPS URL → History shows all deployments with "Visit" links → User can re-deploy anytime with single click → Manual download option available for drag-and-drop to Netlify Drop
- Success criteria: Token testing completes in 3-5 seconds with clear visual feedback for each validation step, connection test shows account name and plan details, failed validations provide specific troubleshooting guidance, first deployment completes in under 30 seconds after entering API token, subsequent deployments are truly one-click with no additional input required, sites are live with HTTPS and global CDN, deployment history persists with live URLs and timestamps, configuration saves securely between sessions, clear visual feedback during deployment process with progress indicators, deployment failures show helpful error messages with troubleshooting guidance, users can delete individual deployments from history or clear all history

**AI-Powered Hashtag Trend Analysis**
- Functionality: Real-time trending hashtag discovery with AI-powered insights, sentiment analysis, engagement scoring, and category filtering
- Purpose: Help users identify trending topics, optimize social media strategies, and make data-driven decisions about content and hashtag usage
- Trigger: Navigate to Trends tab
- Progression: User views auto-generated trending hashtags → Filters by category (technology, business, lifestyle, entertainment, sports, politics, health, education) → Sees detailed metrics (mentions, velocity, engagement score, peak time, sentiment) → Reviews AI-generated insights summary with top categories and best posting times → Clicks related tags to explore connections → Enters custom hashtag in search → AI analyzes custom hashtag for trending potential → Receives detailed analysis with engagement predictions and actionable insights → Toggle auto-refresh for real-time updates → Click refresh button for manual updates
- Success criteria: Trends generate within 3 seconds, display 20+ trending hashtags with comprehensive metrics, AI insights provide actionable recommendations, custom hashtag analysis completes in 2-3 seconds, auto-refresh updates every 30 seconds when enabled, sentiment analysis accurately categorizes positive/neutral/negative, engagement scores reflect realistic trending potential, related tags create explorable connections, category filtering works instantly, peak time recommendations help optimize posting schedules, data persists between sessions

**Page Integration Hub**
- Functionality: Central navigation to all connected pages and projects including infinity-facebook, infinity-twitter, infinity-ebay
- Purpose: Unify multiple existing pages into cohesive experience - each with copyable functions
- Trigger: Click navigation or hub icon
- Progression: User explores hub → Visual cards show each page → Click to navigate → Seamless transitions
- Success criteria: All pages accessible, clear descriptions, smooth navigation

**Multi-Platform Social Posting System**
- Functionality: Post to multiple social media platforms simultaneously with AI enhancement, emoji shortcuts, conversation context integration, and automatic daily backups
- Purpose: Enable seamless cross-platform posting from within Infinity Brain without switching between platforms - truly unified social presence with data protection
- Trigger: Navigate to Social tab or use emoji shortcuts (🤑 for auto-post, 🧲🪐 for context inclusion)
- Progression: User connects platforms (Twitter, Facebook, LinkedIn, Instagram, TikTok) → Types post content → Optionally includes recent conversation context → Uses emoji shortcut or clicks post button → AI enhances content for engagement → Posts simultaneously to all connected platforms → Real-time progress indicators → Success confirmation for each platform → Post saved to history with platform badges → Automatic daily backups run in background preserving all posts and schedules
- Success criteria: Platform connections persist between sessions, emoji shortcuts trigger instant posting, conversation context properly included when requested, AI enhancement maintains authentic voice while improving engagement, posts successfully reach all connected platforms, post history shows all previous posts with timestamps and platform tags, character count warnings for Twitter compatibility, schedule posts for future times, automatic backups run on configured schedule without user intervention

**Automatic Backup Scheduler**
- Functionality: Automated daily backup system that saves all posts, scheduled content, analytics, and settings with customizable frequency and manual backup options
- Purpose: Protect user data through automated, scheduled backups with downloadable JSON files and one-click restore capability - ensuring no content is ever lost
- Trigger: Navigate to Social tab → Backup tab, or automatic execution based on schedule
- Progression: User enables automatic backups → Sets frequency (twice-daily, daily, weekly) → Configures backup time (default 2:00 AM) → System calculates next backup time → Background scheduler monitors time → When scheduled time arrives, system collects all post history, scheduled posts, platform connections, conversation history, and analytics data → Compresses data to JSON → Downloads backup file with timestamp → Stores snapshot in KV storage → Records backup in history → Updates last backup timestamp and calculates next backup time → User can manually trigger backup anytime → View backup history with timestamps, data sizes, and item counts → Restore from any previous backup with one click
- Success criteria: Automatic backups execute on schedule without user action, backups complete within 5 seconds, all relevant data included (posts, schedules, analytics, settings, conversation history), backup files download automatically with timestamped filenames, backup history persists showing type (auto/manual), status, data size, and item count, manual backups work instantly from button click, users can restore from any backup in history, backup settings persist between sessions, next backup time displayed and updates correctly, progress indicator shows backup status, success/failure toasts provide clear feedback, backup files are valid JSON and can be opened externally

**Azure Static Web Apps Deployment**
- Functionality: One-click deployment to Azure Static Web Apps with full configuration management and deployment tracking
- Purpose: Enable professional-grade hosting on Microsoft Azure cloud infrastructure with global CDN and HTTPS
- Trigger: Navigate to Azure tab → Configure Azure settings
- Progression: User enters Azure subscription ID → Provides resource group name → Sets static web app name → Chooses Azure region → Views deployment URL preview → Clicks "Deploy to Azure" → Progress bar shows build/upload stages → Deployment completes with live HTTPS URL → Deployment added to history with visit link → Subsequent deployments use saved configuration
- Success criteria: Azure configuration persists between sessions, subscription ID and resource group validation works, deployment completes in under 30 seconds, deployed sites are live with HTTPS and CDN, deployment history tracks all Azure deployments with timestamps and URLs, clear setup instructions guide new users, deployment failures show helpful error messages

**GitHub Actions CI/CD Workflow Generator**
- Functionality: AI-powered generation of production-ready GitHub Actions workflow files for automated continuous integration and deployment
- Purpose: Enable automated build, test, and deployment pipelines without manual YAML configuration - democratizing DevOps
- Trigger: Navigate to Azure tab → GitHub Actions section → Click "Generate GitHub Actions Workflow"
- Progression: User clicks generate button → AI creates complete workflow YAML with build steps, environment variables, branch-specific deployments, artifact caching, and Azure deployment configuration → Generated workflow displays in code viewer → User downloads YAML file → Workflow file saved as .github/workflows/azure-deploy.yml in repository → Commits trigger automatic build and deployment → Deployment history tracks CI/CD workflow executions
- Success criteria: Generated workflows are valid YAML with no syntax errors, workflows include comprehensive build steps (install, build, test, deploy), environment variable management properly configured, branch-specific deployment logic included, artifact caching optimizes build times, workflows successfully deploy to Azure on commit/push, clear instructions guide users through setup process, downloaded files are immediately usable without modification

**Legend & Help System**
- Functionality: Always-accessible visual guide explaining features and controls
- Purpose: Ensure users understand how to use the platform without confusion
- Trigger: Click help icon or question mark
- Progression: User needs help → Click legend → Visual guide displays with annotations → User understands feature
- Success criteria: Legend is clear, comprehensive, and doesn't obstruct interface

**Sentiment Analysis Heatmap**
- Functionality: AI-powered emotional analysis with D3 heatmap visualization showing sentiment patterns over time
- Purpose: Enable users to understand emotional patterns in text across different times and days, revealing insights about mood and communication trends
- Trigger: Navigate to Sentiment tab and analyze text
- Progression: User enters text → AI analyzes 6 core emotions (joy, sadness, anger, fear, surprise, love) → Scores assigned 0-100 → Overall sentiment calculated → Entry added to heatmap → Patterns visualized by hour and day → User switches between emotion views → Exports analysis data
- Success criteria: Text analyzed accurately with emotion breakdown, interactive D3 heatmap renders showing temporal patterns, hover tooltips display detailed data, entries persist in storage, multiple emotion view modes work, data exportable as JSON, recent analyses list updates dynamically

**Voice Command Integration for Emoji Features**
- Functionality: Hands-free activation of emoji features using natural speech recognition with continuous listening mode, visual feedback, and command history tracking
- Purpose: Enable completely hands-free operation of all emoji-triggered features - users can activate planet pull, backups, security, scans, and all other emoji features through voice commands without touching keyboard or mouse
- Trigger: Navigate to Emoji tab → Click "Enable Voice" button to activate voice recognition
- Progression: User enables voice commands → Microphone icon shows listening status with pulsing animation → User speaks natural commands like "planet pull", "full backup", "mushroom power", "global scan" → Speech recognition processes command → System matches keywords to emoji features (planet/pull, magnet/attract, backup/disk, mushroom/power, security/trident, etc.) → Emoji feature activates with visual toast confirmation → Command logged to history with timestamp and emoji → Last command displays prominently → Command history shows recent 10 commands with timestamps → User can disable voice to stop listening → Voice state persists between sessions
- Success criteria: Voice recognition activates immediately on browser support, continuous listening mode restarts automatically after each command, 18 emoji features all respond to multiple voice keywords (e.g. "planet" or "pull" triggers 🪐), command recognition completes within 500ms, visual feedback shows listening state with pulsing microphone icon, successful commands display emoji and feature name in toast, command history persists in storage with timestamps, unsupported commands show helpful error message, browser compatibility check prevents errors on unsupported browsers, voice state (enabled/disabled) persists between page refreshes, clear visual distinction between listening/idle/disabled states

## Edge Case Handling

- **AI Service Unavailable**: Display friendly message with retry option, allow offline search through cached results
- **Search Timeout**: Show partial results, indicate which sources responded, offer to retry failed sources
- **No Search Results**: Provide helpful suggestions, show similar queries, offer to broaden search
- **Data Visualization Empty State**: Show example visualizations, guide user to generate data
- **Network Interruption**: Cache user input, auto-retry when connection restored, show connection status
- **Unsupported Content**: Gracefully handle unknown data types, provide alternative display options
- **Token Symbol Collision**: Prevent duplicate token symbols, show error with suggestion for alternative
- **Session Expiry**: Gracefully handle expired sessions, prompt re-authentication, preserve unsaved work
- **Login Failure**: Clear error messaging, retry mechanism, fallback to guest mode for non-authenticated features
- **Insufficient Balance**: Prevent transactions with insufficient tokens, display clear balance information
- **Module Not Found**: Handle missing module references, suggest similar modules, allow creation request
- **Platform Connection Failure**: Show clear error when social platform connection fails, provide reconnection option, maintain partial connectivity
- **Deployment Timeout**: Handle long-running deployments with timeout warnings, allow cancellation, preserve deployment state
- **Social Security Distribution Overflow**: Handle extremely large recipient counts (10M+) with batched generation and progressive rendering, prevent browser memory issues
- **Bot Collision Detection**: Prevent duplicate payments when collision protection disabled, warn users of risks, track collision events
- **Invalid Distribution Parameters**: Validate total amount and recipient count, prevent division by zero, handle negative values
- **Distribution Interruption**: Allow pausing/resuming distributions, persist partial completion state, recover from browser refresh
- **Service Category Mismatch**: Handle recipients with invalid service types, provide default category fallback
- **Invalid Azure Credentials**: Validate Azure configuration before deployment, show specific credential errors, guide users to correct setup
- **Workflow Generation Failure**: Gracefully handle AI service errors during workflow generation, offer retry with different parameters, provide manual workflow templates as fallback
- **Emoji Detection Edge Cases**: Handle multiple emojis in single post, prevent double-posting, clear emoji after processing
- **Sentiment Analysis Edge Cases**: Handle empty text submissions gracefully, manage very long text inputs, handle special characters and emojis in sentiment analysis, validate AI response format, provide meaningful error messages when analysis fails
- **Backup System Edge Cases**: Handle backup failures gracefully with clear error messages, retry mechanism for failed backups, prevent backup conflicts when multiple backups triggered simultaneously, validate backup data integrity before storage, handle large backup files (>5MB) with compression warnings, recover gracefully from browser storage quota exceeded, prevent accidental backup deletion with confirmation dialogs, handle corrupted backup files during restore with validation checks, maintain backup history even when backups fail to track issues

## Design Direction

The design should feel modern, sophisticated, and trustworthy - combining the energy of a startup with the reliability of financial infrastructure. Moving completely away from terminal green to embrace a vibrant, gradient-rich aesthetic that feels like a next-generation economic platform. Users should feel confident using it as the foundation for world currency, with every interaction providing clear visual feedback and delightful micro-animations that reinforce security and permanence.

## Color Selection

A bold, vibrant color scheme that combines deep purples and electric blues with energetic accent colors - professional yet exciting.

- **Primary Color**: Deep Purple `oklch(0.45 0.15 300)` - Sophisticated and modern, represents intelligence and creativity
- **Secondary Colors**: Electric Blue `oklch(0.55 0.20 250)` for interactive elements, Soft Lavender `oklch(0.75 0.08 290)` for cards/sections
- **Accent Color**: Vibrant Cyan `oklch(0.70 0.18 200)` - High-energy color for CTAs, buttons, and important highlights
- **Foreground/Background Pairings**: 
  - Primary Purple: White text (#FFFFFF) - Ratio 8.2:1 ✓
  - Electric Blue: White text (#FFFFFF) - Ratio 5.8:1 ✓
  - Vibrant Cyan: Deep Navy `oklch(0.20 0.05 270)` - Ratio 9.1:1 ✓
  - Background: Soft gradient from `oklch(0.95 0.01 280)` to `oklch(0.98 0.01 250)` with subtle mesh pattern

## Font Selection

Typography should balance modern tech aesthetics with readability, using a geometric sans-serif for UI and a friendly sans for content to create approachable sophistication.

- **Typographic Hierarchy**:
  - H1 (Main Title): Space Grotesk Bold / 48px / tight letter-spacing (-0.02em)
  - H2 (Section Headers): Space Grotesk SemiBold / 32px / normal spacing
  - H3 (Card Titles): Space Grotesk Medium / 24px / normal spacing
  - Body Text: Inter Regular / 16px / comfortable line-height (1.6)
  - UI Labels: Inter Medium / 14px / slightly tight spacing (-0.01em)
  - Code/Data: JetBrains Mono / 14px / monospace feel for technical elements

## Animations

Animations should create a sense of fluid intelligence - smooth transitions that feel responsive without delay, with special attention to data visualization animations that show information flowing and connecting. Use spring physics for interactive elements (buttons, cards) and smooth easing for transitions. Graph nodes should gently pulse, search results should cascade in with stagger, and the slot machine should have satisfying mechanical momentum.

## Component Selection

- **Components**: 
  - Card for feature sections and result displays
  - Tabs for switching between search modes (web, images, AI)
  - Dialog for detailed result views and settings
  - Sheet for slide-out legend/help system
  - Input with search icon for query entry
  - Button with variants for different action levels
  - Badge for result tags and categories
  - Progress for search loading states
  - Tooltip for inline help hints
  - Accordion for collapsible sections in legend

- **Customizations**:
  - Custom graph visualization component using D3 for search result connections
  - Custom slot machine component with CSS animations for reel spinning
  - Custom chat bubble component with typing indicators and formatted message display
  - Gradient borders on cards using pseudo-elements
  - Animated background mesh pattern using SVG

- **States**:
  - Buttons: Rest (gradient background), Hover (lift with shadow), Active (press down), Loading (pulse animation)
  - Inputs: Default (subtle border), Focus (glowing cyan ring), Filled (slight background tint), Error (red accent)
  - Cards: Default (soft shadow), Hover (elevated shadow, subtle scale), Selected (colored border)

- **Icon Selection**: 
  - Search: MagnifyingGlass (Phosphor)
  - AI Chat: ChatsCircle
  - Graph/Visualization: ChartNetwork
  - Slot Machine: Coin
  - Help/Legend: Question
  - Navigation: List
  - Settings: Gear
  - Refresh: ArrowsClockwise

- **Spacing**: 
  - Page padding: p-6 md:p-8
  - Section gaps: gap-8
  - Card padding: p-6
  - Inline elements: gap-2
  - Button padding: px-6 py-3

- **Mobile**: 
  - Stack sections vertically on mobile
  - Slide-out sheet navigation for mobile menu
  - Touch-friendly button sizes (min 44px)
  - Collapsible sections for legend/help
  - Full-screen chat on mobile
  - Simplified graph visualization for small screens
