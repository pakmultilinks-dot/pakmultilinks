import { expect, test } from "@playwright/test";

test("login waits for hydration and has a safe native fallback", async ({ page }) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });

  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
    await scriptsReady;
    await route.continue();
  });

  try {
    await page.goto("/admin/login", { waitUntil: "commit" });
    const form = page.locator("form");
    const button = page.getByRole("button", { name: "Sign in securely" });

    await expect(form).toHaveAttribute("method", "post");
    await expect(form).toHaveAttribute("action", "/api/auth/login");
    await expect(button).toBeDisabled();

    releaseScripts();
    await expect(button).toBeEnabled();
  } finally {
    releaseScripts();
  }
});
