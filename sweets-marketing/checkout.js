// checkout.js — Self-Contained Modal Popup Checkout

(function () {
  let stripe = null;
  let elements = null;
  let cardElement = null;
  let currentPlan = null;

  // Initialize Stripe SDK safely
  function initStripe() {
    if (window.Stripe && CONFIG.stripePublicKey) {
      stripe = Stripe(CONFIG.stripePublicKey);
    } else {
      console.error("Stripe.js failed to load or CONFIG.stripePublicKey is missing.");
    }
  }

  // Bind click handlers to all checkout buttons on the page
  document.addEventListener("DOMContentLoaded", () => {
    initStripe();

    const checkoutButtons = document.querySelectorAll("[data-checkout]");
    checkoutButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const planKey = btn.getAttribute("data-checkout") || "starter";
        openCheckoutModal(planKey);
      });
    });

    // Close button & overlay background click events
    document.querySelectorAll("[data-close-modal]").forEach((closeBtn) => {
      closeBtn.addEventListener("click", closeCheckoutModal);
    });

    // ESC key closes modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCheckoutModal();
    });
  });

  // Open self-contained modal popup
  async function openCheckoutModal(planKey) {
    currentPlan = CONFIG.pricing[planKey] || CONFIG.pricing.starter;

    const modal = document.getElementById("checkout-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalSub = document.getElementById("modal-sub");
    const mountPoint = document.getElementById("checkout-mount");
    const modalState = document.getElementById("modal-state");

    if (!modal || !mountPoint) return;

    // Update modal header copy
    if (modalTitle) modalTitle.textContent = `Order ${currentPlan.title}`;
    if (modalSub) modalSub.textContent = `${currentPlan.displayPrice} total • ${currentPlan.pricePerBox}`;

    // Show modal popup
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden"; // Prevent background scrolling

    // Inject custom inline checkout form HTML inside popup
    mountPoint.innerHTML = `
      <form id="payment-form" style="display:flex; flex-direction:column; gap:16px;">
        <div>
          <label style="display:block; font-size:12px; text-transform:uppercase; font-weight:700; margin-bottom:6px; color:#4a4a4a;">Your Name</label>
          <input type="text" id="cust-name" placeholder="First and Last Name" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:inherit; outline:none;" />
        </div>
        <div>
          <label style="display:block; font-size:12px; text-transform:uppercase; font-weight:700; margin-bottom:6px; color:#4a4a4a;">Email Address</label>
          <input type="email" id="cust-email" placeholder="you@company.com" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:14px; font-family:inherit; outline:none;" />
        </div>
        <div>
          <label style="display:block; font-size:12px; text-transform:uppercase; font-weight:700; margin-bottom:6px; color:#4a4a4a;">Credit or Debit Card</label>
          <div id="card-element" style="padding:14px; border:1px solid #ddd; border-radius:8px; background:#fff;"></div>
        </div>
        <div id="card-errors" role="alert" style="color:#e53e3e; font-size:13px; font-weight:600; display:none;"></div>
        <button type="submit" id="submit-pay" class="btn btn-block btn-alt" style="margin-top:10px; width:100%; justify-content:center; padding:14px;">
          <span id="pay-button-text">Pay ${currentPlan.displayPrice} Now</span>
        </button>
      </form>
    `;

    if (modalState) modalState.style.display = "none";

    // Mount Stripe Card Element inside the popup
    if (stripe) {
      elements = stripe.elements();
      cardElement = elements.create("card", {
        style: {
          base: {
            fontSize: "16px",
            color: "#2d3748",
            "::placeholder": { color: "#a0aec0" }
          },
          invalid: { color: "#e53e3e" }
        }
      });
      cardElement.mount("#card-element");

      cardElement.on("change", (event) => {
        const errorDisplay = document.getElementById("card-errors");
        if (event.error) {
          errorDisplay.textContent = event.error.message;
          errorDisplay.style.display = "block";
        } else {
          errorDisplay.textContent = "";
          errorDisplay.style.display = "none";
        }
      });
    }

    // Attach form submission inside popup
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", handleFormSubmit);
  }

  // Handle live inline payment submit
  async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById("submit-pay");
    const payText = document.getElementById("pay-button-text");
    const errorDisplay = document.getElementById("card-errors");
    const emailInput = document.getElementById("cust-email");
    const nameInput = document.getElementById("cust-name");

    submitBtn.disabled = true;
    payText.textContent = "Processing Payment...";

    try {
      // 1. Fetch secret client key from backend serverless function
      const res = await fetch(CONFIG.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: currentPlan.id,
          amount: currentPlan.amount,
          email: emailInput.value
        })
      });

      const data = await res.json();

      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || "Failed to initialize payment session.");
      }

      // 2. Confirm card payment natively inside the popup
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: nameInput.value,
            email: emailInput.value
          }
        }
      });

      if (result.error) {
        errorDisplay.textContent = result.error.message;
        errorDisplay.style.display = "block";
        submitBtn.disabled = false;
        payText.textContent = `Pay ${currentPlan.displayPrice} Now`;
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        // 3. Display Success State right inside the popup!
        document.getElementById("checkout-mount").innerHTML = `
          <div style="text-align:center; padding:30px 10px;">
            <div style="font-size:48px; margin-bottom:10px;">🎉</div>
            <h3 style="font-size:22px; font-weight:800; color:#1a1a1a; margin-bottom:8px;">Order Confirmed!</h3>
            <p style="font-size:14px; color:#555; line-height:1.5;">
              Thank you, <b>${nameInput.value}</b>! We received your <b>${currentPlan.title}</b> ($${currentPlan.amount / 100}) order.<br><br>
              Check your inbox at <b>${emailInput.value}</b> for receipt and instructions to submit your prospect addresses.
            </p>
            <button onclick="document.querySelector('[data-close-modal]').click()" class="btn btn-alt" style="margin-top:20px;">Done</button>
          </div>
        `;
      }
    } catch (err) {
      errorDisplay.textContent = err.message || "An unexpected error occurred.";
      errorDisplay.style.display = "block";
      submitBtn.disabled = false;
      payText.textContent = `Pay ${currentPlan.displayPrice} Now`;
    }
  }

  // Close popup modal
  function closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.hidden = true;
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }
})();
