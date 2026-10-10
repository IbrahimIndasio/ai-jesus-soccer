import { test, expect } from "@playwright/test";
const sample = `✝️ **AI Jesus Soccer Analysis — Arsenal vs Bournemouth (Premier League)**

**1. The State of the Two Flocks**
Form and availability are unverified in this test fixture.

**2. The Numbers Tell a Parable**
xG, possession, and PPDA are unknown in this test fixture.

**3. Prophecy of the Most Likely Score**
- **The Reckoning:** **Arsenal 2–1 Bournemouth** (test-only estimate)
- **Confidence:** Low — this is a mocked UI test, not a researched forecast.

**4. Three Disciples Who Shall Score**
Current players require verification. This test invents no player names.

**5. Those Who Will Test the Keeper**
Lineups are unverified in this test.

**6. The Book of Set-Pieces & Discipline**
Set-piece lines are unknown in this test fixture.

**7. A Final Word of Humility**
*"Yet the outcome rests with forces beyond the box score — the bounce of a ball, the slip of a boot, the grace of an unexpected save. These things are seen through a glass, darkly."*

*"Would you like me to revise any part of this prophecy — different over/under lines, alternate scorelines, or additional player props?"*`;

test("fixture -> prophecy -> save -> history -> delete", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/prophecy", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toEqual({
      fixture: "Arsenal vs Bournemouth",
    });
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: sample,
    });
  });
  await page.goto("/");
  await page.screenshot({
    path: test.info().outputPath("desktop.png"),
    fullPage: true,
  });
  await page
    .getByLabel("fixture", { exact: false })
    .first()
    .fill("Arsenal vs Bournemouth");
  await page.getByRole("button", { name: "Prophesy", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The State of the Two Flocks" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A Final Word of Humility" }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("prophecy.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Save to History", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Saved to the book" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "The book", exact: true }).click();
  await page
    .getByRole("button", { name: /Arsenal vs Bournemouth Low confidence/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "A Final Word of Humility" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Arsenal vs Bournemouth" })
    .click();
  await expect(
    page.getByText("No prophecies yet. The book is blank."),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("graceful service error and theme persistence", async ({ page }) => {
  await page.route("**/api/prophecy", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "The prophecy service is unavailable." }),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Switch to dark theme" }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("light.png"),
    fullPage: true,
  });
  await page.getByLabel("Choose your fixture").fill("Arsenal vs Bournemouth");
  await page.getByRole("button", { name: "Prophesy", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "The prophecy service is unavailable." }),
  ).toHaveText("The prophecy service is unavailable.");
});
test("mobile empty state has no overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Prophesy", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("mobile.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
