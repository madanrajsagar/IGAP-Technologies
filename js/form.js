document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-contact-form]");

  if (!form) {
    return;
  }

  const fields = {
    name: form.querySelector("#name"),
    email: form.querySelector("#email"),
    message: form.querySelector("#message")
  };

  const status = form.querySelector("[data-form-status]");

  const validators = {
    name(value) {
      if (!value.trim()) {
        return "Please enter your name.";
      }

      if (value.trim().length < 2) {
        return "Name must be at least 2 characters.";
      }

      return "";
    },
    email(value) {
      if (!value.trim()) {
        return "Please enter your email address.";
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value.trim())) {
        return "Enter a valid email address.";
      }

      return "";
    },
    message(value) {
      if (!value.trim()) {
        return "Please tell us about your project.";
      }

      if (value.trim().length < 20) {
        return "Message must be at least 20 characters.";
      }

      return "";
    }
  };

  const setError = (fieldName, message) => {
    const field = fields[fieldName];
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);

    field?.setAttribute("aria-invalid", String(Boolean(message)));
    field?.closest(".form-field")?.classList.toggle("has-error", Boolean(message));
    if (error) {
      error.textContent = message;
    }
  };

  const validateField = (fieldName) => {
    const field = fields[fieldName];
    const validator = validators[fieldName];

    if (!field || !validator) {
      return true;
    }

    const message = validator(field.value);
    setError(fieldName, message);
    return !message;
  };

  Object.keys(fields).forEach((fieldName) => {
    fields[fieldName]?.addEventListener("blur", () => validateField(fieldName));
    fields[fieldName]?.addEventListener("input", () => {
      if (fields[fieldName].closest(".form-field")?.classList.contains("has-error")) {
        validateField(fieldName);
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = Object.keys(fields).every((fieldName) => validateField(fieldName));

    if (!status) {
      return;
    }

    if (!isValid) {
      status.textContent = "Please fix the highlighted fields and try again.";
      status.className = "form-status is-error";
      return;
    }

    status.textContent = "Thanks. Your message has been validated and is ready to send.";
    status.className = "form-status is-success";
    form.reset();

    Object.keys(fields).forEach((fieldName) => setError(fieldName, ""));
  });
});
