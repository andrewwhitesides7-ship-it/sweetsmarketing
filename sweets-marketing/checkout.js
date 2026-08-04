// checkout.js — Multi-Company Popup Checkout

(function () {
  let stripe = null;
  let cardElement = null;
  let currentPlan = null;
  let currentStep = 1;

  let formData = {
    senderName: "",
    senderEmail: "",
    qrUrl: "",
    companies: [] // Holds { companyName, city } for each box
  };

  function initStripe() {
    if (typeof CONFIG !== "undefined" && window.Stripe && CONFIG.stripePublicKey) {
      stripe = Stripe(CONFIG.stripePublicKey);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStripe();

    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-checkout]");
      if (btn) {
        e.preventDefault();
        const planKey = btn.getAttribute("data-checkout") || "starter";
        openModal(planKey);
      }

      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        e.preventDefault();
        closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  });

  function openModal(planKey) {
    if (typeof CONFIG === "undefined" || !CONFIG.pricing) {
      alert("Config file error: CONFIG is missing.");
      return;
    }

    currentPlan = CONFIG.pricing[planKey] || CONFIG.pricing.starter;
    currentStep = 1;

    // Initialize company list slots based on package box count
    const totalBoxes = currentPlan.boxes || 5;
    if (formData.companies.length !== totalBoxes) {
      formData.companies = Array.from({ length: totalBoxes }, (_, i) => (
        formData.companies[i] || { companyName: "", city: "" }
      ));
    }

    const modal = document.getElementById("checkout-modal");
    if (!modal) return;

    modal.removeAttribute("hidden");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    renderStep();
  }

  function renderStep() {
    const mountPoint = document.getElementById("checkout-mount");
    const title = document.getElementById("modal-title");
    const sub = document.getElementById("modal-sub");

    if (title) title.textContent = `Order ${currentPlan.title || currentPlan.name}`;
    if (sub) sub.textContent = `${currentPlan.displayPrice} Total • Step ${currentStep} of 2`;

    if (!mountPoint) return;

    if (currentStep === 1) {
      // Build company name & city fields for each box
      const companyFieldsHtml = formData.companies.map((comp, idx) => `
        <div style="background:#f8f9fa; border:1px solid #e2e8f0; padding:10px; border-radius:8px; margin-bottom:8px;">
          <span style="font-size:11px; font-weight:800; color:#ff3d8b; text-transform:uppercase; display:block; margin-bottom:6px;">
            Box #${idx + 1} Target
          </span>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div>
              <input type="text" class="comp-name" data-index="${idx}" value="${comp.companyName}" required placeholder="Company Name *" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;" />
            </div>
            <div>
              <input type="text" class="comp-city" data-index="${idx}" value="${comp.city}" required placeholder="City, State *" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:6px; font-size:12px; box-sizing:border-box;" />
            </div>
          </div>
        </div>
      `).join("");

      mountPoint.innerHTML = `
        <form id="step1-form" style="display:flex; flex-direction:column; gap:12px; width:100%; text-align:left;">
          
          <!-- Universal QR Code Banner -->
          <div style="background:#fff0f6; border:1px solid #ffadd2; padding:10px; border-radius:8px; font-size:12px; color:#c41d7f; line-height:1.4;">
            <strong>📱 Universal QR Code Integration:</strong> We print a custom QR code on every box that links to <b>any URL of your choice</b>—your website, booking link, video pitch, or custom landing page!
          </div>

          <h4 style="margin:2px 0 0; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#ff3d8b;">1. Your Info & Destination URL</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Your Name *</label>
              <input type="text" id="senderName" value="${formData.senderName}" required placeholder="Jane Doe" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Your Email *</label>
              <input type="email" id="senderEmail" value="${formData.senderEmail}" required placeholder="jane@company.com" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;" />
            </div>
          </div>

          <div>
            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">QR Code Link Target (Website, Landing Page, or Booking Link) *</label>
            <input type="url" id="qrUrl" value="${formData.qrUrl}" required placeholder="https://yourwebsite.com/welcome" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;" />
          </div>

          <hr style="border:none; border-top:1px solid #eee; margin:2px 0;" />

          <h4 style="margin:0; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#ff3d8b;">2. Target Companies & Locations (${formData.companies.length} Boxes)</h4>
          <div style="max-height:180px; overflow-y:auto; padding-right:4px;">
            ${companyFieldsHtml}
          </div>

          <button type="submit" style="width:100%; padding:14px; background:#ff3d8b; color:#fff; font-weight:800; border:none; border-radius:8px; cursor:pointer; font-size:15px; margin-top:4px;">
            Continue to Payment →
          </button>
        </form>
      `;

      document.getElementById("step1-form").addEventListener("submit", (e) => {
        e.preventDefault();
        formData.senderName = document.getElementById("senderName").value;
        formData.senderEmail = document.getElementById("senderEmail").value;
        formData.qrUrl = document.getElementById("qrUrl").value;

        // Collect each company name and city
        document.querySelectorAll(".comp-name").forEach((input) => {
          const idx = input.getAttribute("data-index");
          formData.companies[idx].companyName = input.value;
        });

        document.querySelectorAll(".comp-city").forEach((input) => {
          const idx = input.getAttribute("data-index");
          formData.companies[idx].city = input.value;
        });

        currentStep = 2;
        renderStep();
      });

    } else if (currentStep === 2) {
      // Summary of targeted companies
      const companySummaryList = formData.companies.map((c, i) => 
        `<li><b>Box #${i+1}:</b> ${c.companyName} (${c.city})</li>`
      ).join("");

      mountPoint.innerHTML = `
        <form id="payment-form" style="display:flex; flex-direction:column; gap:12px; width:100%; text-align:left;">
          
          <div style="background:#f8f9fa; border:1px solid #e9ecef; border-radius:8px; padding:10px; font-size:12px;">
            <div style="display:flex; justify-between; font-weight:700; border-bottom:1px solid #ddd; padding-bottom:4px; margin-bottom:6px;">
              <span>Target Companies (${formData.companies.length} Boxes)</span>
              <a href="#" id="edit-details" style="color:#ff3d8b; text-decoration:none; margin-left:auto;">Edit</a>
            </div>
            <ul style="margin:0; padding-left:16px; font-size:11px; color:#555; max-height:80px; overflow-y:auto;">
              ${companySummaryList}
            </ul>
            <p style="margin:6px 0 0; color:#ff3d8b; font-size:11px;">🔗 QR Destination: ${formData.qrUrl}</p>
          </div>

          <div>
            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Credit or Debit Card</label>
            <div id="card-element" style="padding:12px; border:1px solid #ccc; border-radius:6px; background:#fff;"></div>
          </div>

          <div id="card-errors" style="color:#e53e3e; font-size:12px; font-weight:600; display:none;"></div>

          <div style="display:flex; gap:10px; margin-top:8px;">
            <button type="button" id="back-btn" style="width:35%; padding:12px; background:#e2e8f0; color:#333; font-weight:700; border:none; border-radius:8px; cursor:pointer;">
              ← Back
            </button>
            <button type="submit" id="submit-pay" style="width:65%; padding:12px; background:#ff3d8b; color:#fff; font-weight:800; border:none; border-radius:8px; cursor:pointer; font-size:15px;">
              <span id="pay-text">Pay ${currentPlan.displayPrice}</span>
            </button>
          </div>
        </form>
      `;

      if (stripe) {
        const elements = stripe.elements();
        cardElement = elements.create("card", { style: { base: { fontSize: "15px" } } });
        cardElement.mount("#card-element");
      }

      document.getElementById("edit-details").addEventListener("click", (e) => {
        e.preventDefault();
        currentStep = 1;
        renderStep();
      });

      document.getElementById("back-btn").addEventListener("click", () => {
        currentStep = 1;
        renderStep();
      });

      document.getElementById("payment-form").addEventListener("submit", handlePayment);
    }
  }

  async function handlePayment(e) {
    e.preventDefault();
    const btn = document.getElementById("submit-pay");
    const payText = document.getElementById("pay-text");
    const errorDiv = document.getElementById("card-errors");

    btn.disabled = true;
    payText.textContent = "Processing...";

    try {
      const res = await fetch(CONFIG.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: currentPlan.id,
          amount: currentPlan.amount,
          email: formData.senderEmail,
          metadata: {
            senderName: formData.senderName,
            qrUrl: formData.qrUrl,
            companyTargets: JSON.stringify(formData.companies)
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.clientSecret) throw new Error(data.error || "Could not reach payment server.");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.senderName,
            email: formData.senderEmail
          }
        }
      });

      if (result.error) {
        errorDiv.textContent = result.error.message;
        errorDiv.style.display = "block";
        btn.disabled = false;
        payText.textContent = `Pay ${currentPlan.displayPrice}`;
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        document.getElementById("checkout-mount").innerHTML = `
          <div style="text-align:center; padding:20px;">
            <div style="font-size:48px; margin-bottom:10px;">📦</div>
            <h2 style="font-size:22px; font-weight:800; margin-bottom:8px; color:#1a1a1a;">Order Confirmed!</h2>
            <p style="font-size:13px; color:#555; line-height:1.5;">
              Thank you, <b>${formData.senderName}</b>! We are printing your customized QR codes pointing to <b>${formData.qrUrl}</b> and preparing your outreach campaign.
            </p>
            <button onclick="location.reload()" style="margin-top:15px; padding:12px 24px; background:#ff3d8b; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Done</button>
          </div>
        `;
      }
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.style.display = "block";
      btn.disabled = false;
      payText.textContent = `Pay ${currentPlan.displayPrice}`;
    }
  }

  function closeModal() {
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.setAttribute("hidden", "true");
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  }
})();
