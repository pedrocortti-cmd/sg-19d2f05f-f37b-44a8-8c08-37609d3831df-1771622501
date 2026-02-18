export default function TestPage() {
  return (
    <div style={{ padding: "50px", fontSize: "24px" }}>
      <h1>✅ TEST PAGE - React está funcionando!</h1>
      <p>Si ves esto, el problema está en index.tsx</p>
      <p>Fecha: {new Date().toLocaleString()}</p>
    </div>
  );
}