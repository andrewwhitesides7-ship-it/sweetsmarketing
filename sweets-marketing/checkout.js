// checkout.js — Multi-Step Self-Contained Modal Checkout

(function () {
  let stripe = null;
  let cardElement = null;
  let currentPlan = null;
  let currentStep = 1;

  // Form State
  let formData = {
    senderName: "",
    senderEmail: "",
    recipientName: "",
    recipientCompany: "",
    recipientAddress: "",
    customMessage: ""
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
    currentPlan = CONFIG.pricing[planKey] || CONFIG.pricing.starter;
    currentStep = 1;

    const modal = document.getElementById("checkout-modal");
    const mountPoint = document.getElementById("checkout-mount");

    if (!modal || !mountPoint) return;

    // Show modal
    modal.removeAttribute("hidden");
    modal.style.display = "flex";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.zIndex = "99999";
    modal.style.background = "rgba(0,0,0,0.8)";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    document.body.style.overflow = "hidden";

    renderStep();
  }

  function renderStep() {
    const mountPoint = document.getElementById("checkout-mount");
    const title = document.getElementById("modal-title");
    const sub = document.getElementById("modal-sub");

    if (title) title.textContent = `Order ${currentPlan.title}`;
    if (sub) sub.textContent = `${currentPlan.displayPrice} Total • Step ${currentStep} of 2`;

    if (currentStep === 1) {
      // STEP 1: Recipient & Sender Information
      mountPoint.innerHTML = `
        <form id="step1-form" style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:440px; text-align:left;">
          <h4 style="margin:0; font-size:14px; text-transform:uppercase; letter-spacing:1px; color:#ff3d8b;">1. Your Details (Sender)</h4>
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

          <hr style="border:none; border-top:1px solid #eee; margin:6px 0;" />

          <h4 style="margin:0; font-size:14px; text-transform:uppercase; letter-spacing:1px; color:#ff3d8b;">2. Target Prospect (Recipient)</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Recipient Name *</label>
              <input type="text" id="recipientName" value="${formData.recipientName}" required placeholder="John Smith (CEO)" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;" />
            </div>
            <div>
              <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Company Name</label>
              <input type="text" id="recipientCompany" value="${formData.recipientCompany}" placeholder="Acme Corp" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;" />
            </div>
          </div>

          <div>
            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Delivery Office Address *</label>
            <input type="text" id="recipientAddress" value="${formData.recipientAddress}" required placeholder="123 Corporate Blvd, Suite 400, New York, NY" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box;" />
          </div>

          <div>
            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Note / Message Included in Box</label>
            <textarea id="customMessage" rows="2" placeholder="e.g., Loved your recent post on LinkedIn! Let's chat." style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; font-size:13px; box-sizing:border-box; font-family:inherit;">${formData.customMessage}</textarea>
          </div>

          <button type="submit" style="width:100%; padding:14px; background:#ff3d8b; color:#fff; font-weight:800; border:none; border-radius:8px; cursor:pointer; font-size:15px; margin-top:8px;">
            Continue to Payment →
          </button>
        </form>
      `;

      document.getElementById("step1-form").addEventListener("submit", (e) => {
        e.preventDefault();
        formData.senderName = document.getElementById("senderName").value;
        formData.senderEmail = document.getElementById("senderEmail").value;
        formData.recipientName = document.getElementById("recipientName").value;
        formData.recipientCompany = document.getElementById("recipientCompany").value;
        formData.recipientAddress = document.getElementById("recipientAddress").value;
        formData.customMessage = document.getElementById("customMessage").value;

        currentStep = 2;
        renderStep();
      });

    } else if (currentStep === 2) {
      // STEP 2: Payment Details & Order Summary
      mountPoint.innerHTML = `
        <form id="payment-form" style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:440px; text-align:left;">
          <div style="background:#f8f9fa; border:1px solid #e9ecef; border-radius:8px; padding:12px; font-size:12px;">
            <div style="display:flex; justify-between; font-weight:700; border-bottom:1px solid #ddd; padding-bottom:6px; margin-bottom:6px;">
              <span>Deliver To: ${formData.recipientName} ${formData.recipientCompany ? `(${formData.recipientCompany})` : ''}</span>
              <a href="#" id="edit-details" style="color:#ff3d8b; text-decoration:none; margin-left:auto;">Edit</a>
            </div>
            <p style="margin:0; color:#666; font-size:11px;">${formData.recipientAddress}</p>
          </div>

          <div>
            <label style="display:block; font-size:11px; font-weight:700; margin-bottom:4px; color:#333;">Card Payment</label>
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
          metadata: formData // Sends all recipient details to backend!
        })
      });

      const data = await res.json();
      if (!res.ok || !data.clientSecret) throw new Error(data.error || "Could not reach server endpoint.");

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
            <div style="font-size:48px; margin-bottom:10px;">🍪</div>
            <h2 style="font-size:22px; font-weight:800; margin-bottom:8px; color:#1a1a1a;">Order Confirmed!</h2>
            <p style="font-size:13px; color:#555; line-height:1.5;">
              Thank you, <b>${formData.senderName}</b>! We are preparing your cookie box for <b>${formData.recipientName}</b>.<br><br>
              A confirmation receipt was sent to <b>${formData.senderEmail}</b>.
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
