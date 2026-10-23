"use client";

export function GiftCardIntro() {
  const scrollToBuilder = () => {
    document.getElementById("gift-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="gift-intro info80-gift-intro">
      <div className="container-ed gift-intro-shell">
        <div className="gift-intro-copy">
          <p className="eyebrow">EVERY DETAIL GIFT CARDS</p>
          <span>Give them a cleaner car.</span>
          <p className="info80-gift-intro-copy">Choose the amount. They can use it toward any Every Detail service.</p>
          <button type="button" className="gift-intro-scroll" onClick={scrollToBuilder}>Build a gift card <i aria-hidden="true">↓</i></button>
        </div>
        <div className="gift-intro-card-wrap">
          <div className="gift-card-preview gift-card-preview-lg gift-card-preview-intro">
            <div className="gift-card-top"><span>EVERY DETAIL</span><b>GIFT CARD</b></div>
            <div className="gift-card-center"><strong>A better kind<br />of clean.</strong></div>
            <div className="gift-card-bottom"><span>MOBILE DETAILING · DECATUR + ATLANTA</span><i>ED</i></div>
          </div>
        </div>
      </div>
    </section>
  );
}
