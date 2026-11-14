import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useForm, ValidationError } from "@formspree/react";
import type { BoatModel } from "../cms";
import { COMPANY, SERVICE_DESK } from "../content/site";
import { SERVICES } from "../content/services";
import { revealDelay } from "../useScrollReveal";

export const GENERAL_INTEREST = "General enquiry";
export const BESPOKE_INTEREST = "Bespoke build";

interface EnquiryState {
  interest: string;
  message: string;
  setInterest: (interest: string) => void;
  setMessage: (message: string) => void;
}

const EnquiryContext = createContext<EnquiryState | null>(null);

/** Holds the enquiry draft so any page can pre-select a subject before the visitor reaches the form. */
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [interest, setInterest] = useState(GENERAL_INTEREST);
  const [message, setMessage] = useState("");
  const value = useMemo(() => ({ interest, message, setInterest, setMessage }), [interest, message]);
  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error("useEnquiry must be used inside EnquiryProvider");
  return context;
}

function EnquiryForm({ boats }: { boats: BoatModel[] }) {
  const [state, handleSubmit] = useForm("mjykyokj");
  const { interest, message, setInterest, setMessage } = useEnquiry();

  if (state.succeeded) {
    return (
      <div className="enquiry-success" role="status">
        <span className="enquiry-success-mark" aria-hidden="true" />
        <p className="enquiry-success-title">Thank you. Your message is with us.</p>
        <p className="enquiry-success-copy">Our team will reply within one business day.</p>
      </div>
    );
  }

  const known = [GENERAL_INTEREST, BESPOKE_INTEREST, ...boats.map((boat) => boat.name), ...SERVICES.map((service) => service.name)];

  return (
    <form className="enquiry-form" onSubmit={handleSubmit}>
      <div className="enquiry-grid">
        <div className="field">
          <label htmlFor="enquiry-name">Name</label>
          <input id="enquiry-name" type="text" name="name" autoComplete="name" required />
          <ValidationError className="field-error" prefix="Name" field="name" errors={state.errors} />
        </div>
        <div className="field">
          <label htmlFor="enquiry-email">Email</label>
          <input id="enquiry-email" type="email" name="email" autoComplete="email" required />
          <ValidationError className="field-error" prefix="Email" field="email" errors={state.errors} />
        </div>
        <div className="field">
          <label htmlFor="enquiry-phone">
            Phone <span>Optional</span>
          </label>
          <input id="enquiry-phone" type="tel" name="phone" autoComplete="tel" />
          <ValidationError className="field-error" prefix="Phone" field="phone" errors={state.errors} />
        </div>
        <div className="field">
          <label htmlFor="enquiry-interest">I'm interested in</label>
          <select id="enquiry-interest" name="interest" value={interest} onChange={(event) => setInterest(event.target.value)}>
            <option>{GENERAL_INTEREST}</option>
            {boats.length > 0 && (
              <optgroup label="Fleet">
                {boats.map((boat) => (
                  <option key={boat.id}>{boat.name}</option>
                ))}
              </optgroup>
            )}
            <optgroup label="Build">
              <option>{BESPOKE_INTEREST}</option>
            </optgroup>
            <optgroup label="Services">
              {SERVICES.map((service) => (
                <option key={service.id}>{service.name}</option>
              ))}
            </optgroup>
            {!known.includes(interest) && <option>{interest}</option>}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="enquiry-message">Message</label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Your boat, the model or service you have in mind, and your timing."
          required
        />
        <ValidationError className="field-error" prefix="Message" field="message" errors={state.errors} />
      </div>

      <ValidationError className="field-error" errors={state.errors} />

      <div className="enquiry-actions">
        <p>We reply within one business day.</p>
        <button className="btn btn-gold" type="submit" disabled={state.submitting}>
          {state.submitting ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}

interface EnquirySectionProps {
  boats: BoatModel[];
  title?: ReactNode;
  copy?: string;
}

export default function EnquirySection({ boats, title, copy }: EnquirySectionProps) {
  return (
    <section className="section theme-dark enquiry" id="contact">
      <div className="wrap enquiry-layout">
        <div className="enquiry-intro" data-reveal="">
          <p className="eyebrow">Enquiries</p>
          <h2 className="display-2">{title ?? "Begin the conversation."}</h2>
          <p className="lede">
            {copy ?? "A new build, a bespoke commission or work on the boat you already own — tell us what you have in mind and the right person will come back to you."}
          </p>
          <dl className="contact-list">
            <div>
              <dt>The yard</dt>
              <dd>
                {COMPANY.yard}
                <br />
                {COMPANY.postal}
                <br />
                <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
              </dd>
            </div>
            <div>
              <dt>Engineering & Service department</dt>
              <dd>
                {SERVICE_DESK.name}
                <br />
                <a href={SERVICE_DESK.phoneHref}>{SERVICE_DESK.phone}</a>
                <br />
                <a href={`mailto:${SERVICE_DESK.email}`}>{SERVICE_DESK.email}</a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="enquiry-panel" data-reveal="" style={revealDelay(140)}>
          <EnquiryForm boats={boats} />
        </div>
      </div>
    </section>
  );
}
