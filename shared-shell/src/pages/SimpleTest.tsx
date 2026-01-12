const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
      <h1>TEST PAGE - If you see this, React is working</h1>
      <p>Current time: {new Date().toLocaleString()}</p>
      <button onClick={() => alert('Button clicked!')}>Click me</button>
    </div>
  );
};

export default SimpleTest;
