export function Loading({ label = "Cargando", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div className={fullScreen ? "loading loading--screen" : "loading"}>
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}
