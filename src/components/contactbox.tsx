// Make sure to run npm install @formspree/react
// For more help visit https://formspr.ee/react-help
import { useForm, ValidationError } from '@formspree/react';

function ContactForm() {
  const [state, handleSubmit] = useForm("mjykyokj");
  if (state.succeeded) {
      return (
        <div className="contact-success" role="status">
          <span className="contact-success-mark" aria-hidden="true">&#10003;</span>
          <p className="contact-success-title">Message received.</p>
          <p className="contact-success-copy">Our build team will be in touch shortly.</p>
        </div>
      );
  }
  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-heading">
        <span className="contact-form-kicker">Start a conversation</span>
        <span className="contact-form-note">We reply within one business day</span>
      </div>

      <div className="contact-form-grid">
        <div className="contact-field">
          <label htmlFor="name">Your name</label>
          <input id="name" type="text" name="name" autoComplete="name" placeholder="Alex Morgan" required />
          <ValidationError prefix="Name" field="name" errors={state.errors} />
        </div>

        <div className="contact-field">
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" name="email" autoComplete="email" placeholder="alex@example.com" required />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>
      </div>

      <div className="contact-field">
        <label htmlFor="message">Tell us about your brief</label>
        <textarea id="message" name="message" rows={5} placeholder="Tell us which model or custom build you have in mind..." required />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </div>

      <div className="contact-form-footer">
        <p>Dubai, UAE <span aria-hidden="true">/</span> Global enquiries welcome</p>
        <button className="contact-submit" type="submit" disabled={state.submitting}>
          {state.submitting ? "Sending..." : "Send enquiry"}
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
    </form>
  );
}

function ContactBox() {
  return (
    <ContactForm />
  );
}

export default ContactBox;