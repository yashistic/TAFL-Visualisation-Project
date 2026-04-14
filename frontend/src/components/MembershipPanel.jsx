import { useState } from 'react';

export default function MembershipPanel({ regex, onCheck }) {
  const [testString, setTestString] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function check() {
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const accepted = await onCheck(testString);
      setResult(accepted);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <p className="panel-label">Membership</p>
      <h2>Does a string belong to L(r)?</h2>

      <div className="field">
        <label>Input string</label>
        <input
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="aba"
        />
      </div>

      <button onClick={check} disabled={loading}>
        {loading ? 'Checking…' : 'Test membership'}
      </button>

      {error && <p className="error-text">{error}</p>}
      {result === true && <p className="success-text">Accepted ✓</p>}
      {result === false && <p className="reject-text">Rejected ✗</p>}
    </section>
  );
}