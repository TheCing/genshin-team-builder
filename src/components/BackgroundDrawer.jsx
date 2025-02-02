import { useState, useEffect } from "preact/hooks";

export default function BackgroundDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedBg, setSelectedBg] = useState(
    localStorage.getItem("selectedBackground") || null
  );

  // Load background images on mount
  useEffect(() => {
    // Get all background images from the /images/bg directory
    const bgImages = [
      "/images/bg/014e54f8bod6ec264b09a0c6ae99f5b3.jpeg",
      "/images/bg/03c62e738h3b6cf5d3f87ff8f9d310b3.jpeg",
      "/images/bg/17c05ad08p81fe11ef36fe0974d1c06a.jpeg",
      "/images/bg/17fcac424g604af619c3122f581d8728.jpeg",
      "/images/bg/1a29fba6bp793260ed8505260196df34.jpeg",
      "/images/bg/2021052010522939751.jpg",
      "/images/bg/26f8d31aeu76031e402347488d6f4704.jpeg",
      "/images/bg/28a113f2ao9a314d0ec0d3778804c970.jpeg",
      "/images/bg/28d1dae23qcf8856469b2ec624dbdd59.jpeg",
      "/images/bg/2ae28d275l394e192805470cbf7ce904.jpeg",
      "/images/bg/35847049fi62bbeed2be30db35d896ac.jpeg",
      "/images/bg/3c18ba1a1vf8e2c1bee7cb5cd6736bc6.jpeg",
      "/images/bg/3e2ccd9d6u9f5bd479056b029bf2b60e.jpeg",
      "/images/bg/40d65925fu739293e3f9960dd999f414.jpeg",
      "/images/bg/41d4acadct5a8b826b4dd0d6b7934249.jpeg",
      "/images/bg/44e1f6d90p5cf2fd1425317e601cd6c5.jpeg",
      "/images/bg/4b4dc2cdai2ca7cfcf268edc5e081abc.jpeg",
      "/images/bg/4c5795ceelc223c3a2cca1ba7ccfead8.jpeg",
      "/images/bg/516dfc05cvd0d78726bf7adfd9dd0d39.jpeg",
      "/images/bg/5301fd85bnfcbd6631fa2d61a8d7d28d.jpeg",
      "/images/bg/53bd2fd95vd66dbc1c3506962c781439.jpeg",
      "/images/bg/55ca4a827ka97b28f2e9799556d24e3d.jpeg",
      "/images/bg/564e20255t78246930181393cdd63e01.jpeg",
      "/images/bg/585712e17qe6c70a309067ee5c180a0f.jpeg",
      "/images/bg/5c19f1235obdd5db8fa2551e03daa37e.jpeg",
      "/images/bg/5dcb27a68mef0f11dab980dfda2e18b5.jpeg",
      "/images/bg/610a5f5d2meca901993d528310743232.jpeg",
      "/images/bg/6121f81c9q3b5b10abe983c34ba4e59a.jpeg",
      "/images/bg/64ddd598bj837b8673659ed0b884bedf.jpeg",
      "/images/bg/6773faab7n50966dae035b6142328bec.jpeg",
      "/images/bg/6be115d40nbc04bea1fcf77b4ded8372.jpeg",
      "/images/bg/7093afdd3q3788a3a8018e9c168455fb.jpeg",
      "/images/bg/716be07bcn04c73e7b88544ef33715e6.jpeg",
      "/images/bg/73acd6baah4bcbde32a575f05f2de184.jpeg",
      "/images/bg/797e4ea78o83d972a53dd756613fd1d6.jpeg",
      "/images/bg/805060ea7p2c167cd4f8c21970becec2.jpeg",
      "/images/bg/812cd4980ied2268240802622b80c800.jpeg",
      "/images/bg/834930276k96d2e6cd89f51432dc2203.jpeg",
      "/images/bg/8e235dc10o518f50936b9310d20f10ca.jpeg",
      "/images/bg/8f383cc7dge5126cea76c5a547ca1b09.jpeg",
      "/images/bg/9607dae13u40c3e4f0d94a175702dbe6.jpeg",
      "/images/bg/96ad7b769v7ec7326c084cedcfab483c.jpeg",
      "/images/bg/a21b92b6em2e09d7b327b8748cdf27ce.jpeg",
      "/images/bg/a2fccfcc4r10d43977eb5bd4bb0adb1f.jpeg",
      "/images/bg/a31fab71cr70f52cf364ede0b171ef0a.jpeg",
      "/images/bg/ada7fbc86r5809ef580e4f41e25c9061.jpeg",
      "/images/bg/b874d6ca0qf905e1c655a57b286e606b.jpeg",
      "/images/bg/bdda22d7bo723668abb6db2d4803298a.jpeg",
      "/images/bg/bf6036cd6gdfb7de68332c639d26a80f.jpeg",
      "/images/bg/c1e74b043q9ebd08d17650017a36aa48.jpeg",
      "/images/bg/c6de9665as06a847cc1965e5b007609f.jpeg",
      "/images/bg/cc7dd1b0btc3c46fca18c054e4a40d07.jpeg",
      "/images/bg/cf9fee62cpc523099561a5876764e868.jpeg",
      "/images/bg/d1fa69909oe5f71790ea32f0bc0c4c01.jpeg",
      "/images/bg/d419e0ef5mb3e2e91e3b7dede67a925d.jpeg",
      "/images/bg/d592ae07bpbc4593239c8b0271872c00.jpeg",
      "/images/bg/d6e73b0f9pe9fbd9d86cf4e4c1b199cd.jpeg",
      "/images/bg/dd0379769t5aeb05144cc063fc932a05.jpeg",
      "/images/bg/dea2756c3r137c3f50452e2e14fe323a.jpeg",
      "/images/bg/df7d66b1dh55adabc304387c16453cc7.jpeg",
      "/images/bg/e0f98bf54pcd6bbdfe45767706cc6a3e.jpeg",
      "/images/bg/e18a9a51bjfdfb16ababb02e8895eea0.jpeg",
      "/images/bg/e7746b65do465a367ca2743c837810c7.jpeg",
      "/images/bg/f52d9b760ke14ce83e3cd1a04492dba4.jpeg",
      "/images/bg/f816c3c9fh549c32db8bd8c06fbcaeae.jpeg",
      "/images/bg/GilwBJFXIAAy94e.jpeg",
    ];

    setBackgrounds(bgImages);

    // If there's a saved background, apply it
    const savedBg = localStorage.getItem("selectedBackground");
    if (savedBg) {
      setSelectedBg(savedBg);
    } else if (bgImages.length > 0) {
      // Set first background as default if none saved
      setSelectedBg(bgImages[0]);
    }
  }, []);

  // Update background when selection changes
  useEffect(() => {
    if (selectedBg) {
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${selectedBg})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundAttachment = "fixed";
      localStorage.setItem("selectedBackground", selectedBg);
    }
  }, [selectedBg]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectBackground = (bgPath) => {
    setSelectedBg(bgPath);
  };

  return (
    <div
      className={`background-drawer ${isOpen ? "background-drawer--open" : ""}`}
    >
      <button
        className="background-drawer__toggle"
        onClick={toggleDrawer}
        aria-label={
          isOpen ? "Close background selector" : "Open background selector"
        }
      >
        {isOpen ? "←" : "→"}
      </button>
      <div className="background-drawer__content">
        <h3 className="background-drawer__title">Select Background</h3>
        <div className="background-drawer__list">
          {backgrounds.map((bgPath) => (
            <button
              key={bgPath}
              className={`background-drawer__item ${
                selectedBg === bgPath ? "background-drawer__item--selected" : ""
              }`}
              onClick={() => handleSelectBackground(bgPath)}
            >
              <div
                className="background-drawer__thumbnail"
                style={{ backgroundImage: `url(${bgPath})` }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
