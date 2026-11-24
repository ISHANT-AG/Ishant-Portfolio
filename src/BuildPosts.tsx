const posts = [
  {
    "media": "/assets/vehicle-speed",
    "title": "Multi-Vehicle Speed Detection",
    "link": "https://lnkd.in/p/g9czTUPk",
    "body": "What if a single traffic camera could track every vehicle and measure its speed in real time? 👀🚗\n\nI built an AI-powered Multi-Vehicle Speed Detection System using standard CCTV footage + Computer Vision.\n\nHere is what the system does automatically in real time:\n🔹 Detects and classifies: Recognises cars, motorcycles, buses, and trucks using YOLOv8.\n🔹 Tracks Motion: Assigns persistent IDs and motion trails via a custom centroid tracker.\n🔹 Calculates Speed: Uses a virtual two-line speed trap to compute exact speed in km/h.\n🔹 Captures Evidence: Instantly crops and saves snapshots of overspeeding vehicles.\n🔹 Logs & Analyses: Exports full audit CSV records and auto-generates speed \ndistribution graphs.\n\nThe pipeline continuously processes real-time surveillance video at 30+ FPS without requiring expensive radar hardware.\n\nOne camera. Zero radar sensors, automated safety monitoring.\n\nI attempted to turn a real-world road safety challenge into a scalable AI system. \n🤖🚀#ComputerVision #YOLOv8 #OpenCV #Python #ArtificialIntelligence #MachineLearning #SmartCities\nVellore Institute of Technology\nUltralytics OpenCV"
  },
  {
    "media": "/assets/pdf-extractor",
    "title": "Multi-PDF Topic Extractor",
    "link": "https://lnkd.in/p/guiMc7yf",
    "body": "🚀 Built something I'm excited to share: Multi-PDF Topic Extractor\nEver needed to compare how different sources explain the same concept? I built a tool that lets you upload up to 5 PDFs, enter any topic or keyword, and instantly see how each document defines and discusses it — side by side.\n\n🔍 Key features:\n ✅ Extracts & compares topics across multiple PDFs at once\n ✅ TF-IDF + Cosine Similarity for relevance scoring\n ✅ 100% offline & local — no data leaves your machine\n ✅ Side-by-side and grid views for easy comparison\n ✅ One-click summary download\n\n🛠️ Tech stack: Python, Flask, pdfplumber, scikit-learn\nThis started as a way to speed up research and cross-referencing across documents, and turned into a fully local, privacy-first tool. Would love your thoughts and feedback!\n\n🔗 GitHub: https://lnkd.in/d-8ZTxwU\n#Python #MachineLearning #NLP #OpenSource #Flask #BuildInPublic #WebDev"
  }
];

export default function BuildPosts() {
  return (
    <section className="interface-films build-posts" aria-label="Project posts">
      <h4>Project posts</h4>
      {posts.map(({ title, body, link, media }) => (
        <article key={link}>
          <h5>{title}</h5>
          <video controls playsInline preload="metadata" poster={media + ".jpg"} src={media + ".mp4"} aria-label={title + " demo"} />
          <p>{body}</p>
          <a href={link} target="_blank" rel="noreferrer">View original on LinkedIn ↗</a>
        </article>
      ))}
    </section>
  );
}
