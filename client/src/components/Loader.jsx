export default function Loader({ label = "Loading...", fullScreen = false }) {
  return (
    <div className={`loader-wrap ${fullScreen ? "full" : ""}`}>
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
