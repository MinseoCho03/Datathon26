const path = require("node:path");
const { pathToFileURL } = require("node:url");
const fs = require("node:fs");
const { chromium } = require("playwright");

async function main() {
  const root = path.resolve(__dirname, "..");
  const loginUrl = pathToFileURL(path.join(root, "index.html")).href;
  const funderUrl = pathToFileURL(path.join(root, "funder", "index.html")).href;
  const creatorUrl = pathToFileURL(path.join(root, "creator", "index.html")).href;
  const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const launchOptions = fs.existsSync(chromePath)
    ? { headless: true, executablePath: chromePath }
    : { headless: true };
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(loginUrl, { waitUntil: "load" });
  const loginTitle = await page.getByRole("heading", { name: "Opportunity Atlas" }).textContent();
  const funderLinkVisible = await page.getByRole("link", { name: /Funder/ }).isVisible();

  await page.goto(funderUrl, { waitUntil: "load" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector("#overview.active");
  const overviewTitle = await page.locator("#overview-title").textContent();

  await page.getByRole("button", { name: "Discover Projects" }).click();
  await page.locator('#discovery select[data-filter="country"]').selectOption("Ghana");
  const ghanaCards = await page.locator("#discovery .project-card").count();

  await page.locator("#discovery").getByRole("button", { name: "View Evaluation Packet" }).first().click();
  const detailTitle = await page.locator("#detail-title").textContent();
  const projectSnapshot = await page.locator("#detail").getByRole("heading", { name: "Project Snapshot" }).textContent();
  const snapshotReviewStatus = await page.locator("#detail").getByText("Current Review Status").first().textContent();
  const fundingContext = await page.locator("#detail").getByRole("heading", { name: "Funding Context" }).textContent();
  const similarNote = await page.locator("#detail").getByText("Similar funded projects indicate funder relevance").textContent();
  const gapLabel = await page.locator("#detail .badge").filter({ hasText: "Medium-High" }).first().textContent();
  await page.locator("#detail").getByRole("button", { name: "Shortlist" }).first().click();
  const reviewToast = await page.locator("#detail .toast").textContent();
  const reviewStatus = await page.locator("#detail .badge").filter({ hasText: "Current Review Status" }).first().textContent();
  await page.getByRole("button", { name: "Review Queue" }).click();
  const queueStatusVisible = await page.locator("#queue").getByText("Offline-first learning app for rural schools").first().isVisible();

  await page.getByRole("button", { name: "Funding Signals" }).click();
  const totalFunding = await page.locator("#signals .kpi strong").first().textContent();

  await page.goto(creatorUrl, { waitUntil: "load" });
  await page.waitForSelector("#submit.active");
  await page.locator('input[name="evidence"]').fill("https://example.org/demo");
  await page.locator('input[name="pilotPartner"]').fill("Bogota Public Library Network");
  await page.locator('input[name="usersReached"]').fill("80 students reached");
  await page.locator('textarea[name="budgetBreakdown"]').fill("$8,000 facilitation, $2,000 SMS/tools, $2,000 evaluation");
  await page.locator('textarea[name="tractionEvidence"]').fill("Two workshops completed with student feedback.");
  await page.getByRole("button", { name: "Generate Opportunity Profile" }).click();
  const previewTitle = await page.locator("#profile-preview").getByRole("heading", { name: "Self-Reported Opportunity Profile" }).textContent();
  const previewText = await page.locator("#submit").getByText("Your project has been converted").textContent();
  await page.locator("#submit").getByRole("button", { name: "View in Funder Dashboard" }).click();
  const submittedProjectVisible = await page.getByText("Community tutoring map for public libraries").first().isVisible();
  await page
    .locator("#discovery .project-card")
    .filter({ hasText: "Community tutoring map for public libraries" })
    .getByRole("button", { name: "View Evaluation Packet" })
    .click();
  const submittedDetailTitle = await page.locator("#detail-title").textContent();
  const evidenceStatus = await page.locator("#detail").getByRole("heading", { name: "Evidence Status" }).textContent();
  const readinessRationale = await page.locator("#detail").getByText("Why this readiness?").textContent();
  const coverageNote = await page.locator("#detail").getByText("Funder relevance is based on available OECD funding records").textContent();
  await page.goto(funderUrl, { waitUntil: "load" });
  await page.getByRole("button", { name: "Discover Projects" }).click();
  const persistsAfterRefresh = await page.getByText("Community tutoring map for public libraries").first().isVisible();
  await page.getByRole("button", { name: "Review Queue" }).click();
  const statusPersistsAfterRefresh = await page.locator("#queue").getByText("Offline-first learning app for rural schools").first().isVisible();

  await page.screenshot({ path: path.join(root, "opportunity-atlas-smoke.png"), fullPage: true });
  await browser.close();

  console.log(
    JSON.stringify(
      {
        loginTitle,
        funderLinkVisible,
        overviewTitle,
        ghanaCards,
        detailTitle,
        projectSnapshot,
        snapshotReviewStatus,
        fundingContext,
        similarNote,
        gapLabel,
        reviewToast,
        reviewStatus,
        queueStatusVisible,
        totalFunding,
        previewTitle,
        previewText,
        submittedProjectVisible,
        submittedDetailTitle,
        evidenceStatus,
        readinessRationale,
        coverageNote,
        persistsAfterRefresh,
        statusPersistsAfterRefresh,
        errors,
      },
      null,
      2,
    ),
  );

  if (
    errors.length ||
    loginTitle !== "Opportunity Atlas" ||
    !funderLinkVisible ||
    overviewTitle !== "Opportunity Atlas" ||
    ghanaCards < 1 ||
    !totalFunding ||
    !submittedProjectVisible ||
    !persistsAfterRefresh ||
    !statusPersistsAfterRefresh
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
