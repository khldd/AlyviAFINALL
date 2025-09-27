import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Login and verify outcome
        page.goto("http://localhost:3000/auth/login")
        page.get_by_label("Adresse email").fill("hr.manager@techcorp.fr")
        page.get_by_label("Mot de passe").fill("password123")
        page.get_by_role("button", name="Se connecter").click()

        # Wait for either redirection or an error message
        try:
            # First, check for successful redirection
            expect(page).to_have_url(re.compile(r".*/$"), timeout=10000)
            print("Login successful, proceeding with tests.")
        except AssertionError:
            # If redirection fails, check for an error message on the page
            print("Redirect failed, checking for error message.")
            error_alert = page.locator('[role="alert"] [class*="AlertDescription"]')
            try:
                expect(error_alert).to_be_visible(timeout=5000)
                error_text = error_alert.inner_text()
                raise Exception(f"Login failed with error: {error_text}")
            except AssertionError:
                 raise Exception("Login failed: No redirect and no visible error message found.")

        # 2. Verify initial employee count is 0
        dashboard_card = page.get_by_role("heading", name="Employés actifs").locator("..").locator("..")
        expect(dashboard_card.locator(".text-2xl.font-bold")).to_have_text("0", timeout=15000)

        # 3. Navigate to payroll import page
        page.goto("http://localhost:3000/payroll")

        # 4. Upload file
        expect(page.get_by_text("Glissez-déposez votre fichier")).to_be_visible()
        file_input = page.locator('input[type="file"]')
        file_input.set_input_files("jules-scratch/verification/sample_payroll.csv")
        expect(page.get_by_text("sample_payroll.csv")).to_be_visible()

        # 5. Process import
        page.get_by_role("button", name="Traiter le fichier").click()

        # 6. Verify import success
        results_card = page.get_by_role("heading", name="Résultats de l'import").locator("..").locator("..")
        expect(results_card.get_by_text("1", exact=True).first).to_be_visible(timeout=20000)

        # 7. Navigate back to dashboard
        page.goto("http://localhost:3000/")

        # 8. Verify employee count has increased to 1
        expect(dashboard_card.locator(".text-2xl.font-bold")).to_have_text("1", timeout=15000)

        # 9. Screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot captured successfully.")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)