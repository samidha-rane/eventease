import { Link } from "react-router-dom";
import CountUp from "./CountUp";

export function Hero() {
  return (
    <section className="ee-hero">
      <div className="ee-hero__inner">
        <div>
          <h1 className="ee-rise" style={{ "--i": 0 }}>Find your next event. Book it in a minute.</h1>
          <p className="ee-hero__lead ee-rise" style={{ "--i": 1 }}>
            Browse upcoming events, get your ticket, and keep every booking in one place.
          </p>
          <div className="ee-hero__actions ee-rise" style={{ "--i": 2 }}>
            <Link to="/events" className="ee-btn ee-btn--primary">Browse events</Link>
            <Link to="/signup" className="ee-btn ee-btn--ghost">Host an event</Link>
          </div>
        </div>

        {/* Decorative sample ticket. Replace text with a real featured event later. */}
        <div className="ee-ticket" aria-hidden="true">
          <div className="ee-ticket__main">
            <div className="ee-ticket__title">Sunset Music Night</div>
            <div className="ee-ticket__meta">Sat, 7:00 PM</div>
            <div className="ee-ticket__meta">Open-air stage, Mumbai</div>
          </div>
          <div className="ee-ticket__stub">ADMIT ONE</div>
        </div>
      </div>
    </section>
  );
}

// Pass real numbers from your API, e.g. <Stats items={[{ to: events.length, label: "Upcoming events" }]} />
export function Stats({ items = [
  { to: 8, label: "Upcoming events" },
  { to: 5, label: "Venues" },
  { to: 6, label: "Categories" },
  { to: 120, label: "Tickets booked", suffix: "+" },
] }) {
  return (
    <section className="ee-stats">
      <div className="ee-stats__grid">
        {items.map((s) => (
          <div key={s.label}>
            <div className="ee-stat__num"><CountUp to={s.to} suffix={s.suffix || ""} /></div>
            <div className="ee-stat__label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Replace the list with your real category names.
export function CategoryMarquee({ items = ["Music", "Tech talks", "Workshops", "Food and drink", "Sports", "Art", "Networking"] }) {
  const group = (
    <div className="ee-marquee__group" aria-hidden="true">
      {items.map((c) => (
        <span className="ee-marquee__item" key={c}>{c} ✦</span>
      ))}
    </div>
  );
  return (
    <div className="ee-marquee" role="presentation">
      <div className="ee-marquee__track">{group}{group}</div>
    </div>
  );
}