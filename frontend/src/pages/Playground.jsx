import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GeneratorPanel from '../components/GeneratorPanel.jsx';
import MembershipPanel from '../components/MembershipPanel.jsx';
import EquivalencePanel from '../components/EquivalencePanel.jsx';

/** Deterministic listing in the generator panel (lengths 0–3). */
const GENERATE_MAX_LENGTH = 3;
/** Random samples can use strings up to this length (longer strings than the initial listing). */
const SAMPLE_MAX_LENGTH = 20;

export default function Playground() {
  const location = useLocation();
  const [regex, setRegex] = useState('(a|b)*');
  const [groupedStrings, setGroupedStrings] = useState(null);
  const [allStrings, setAllStrings] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  const [sampledStrings, setSampledStrings] = useState([]);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleMessage, setSampleMessage] = useState('');

  useEffect(() => {
    const init = location.state?.initialRegex;
    if (typeof init === 'string' && init.length > 0) {
      setRegex(init);
    }
  }, [location.state]);

  async function handleGenerate() {
    setGenError('');
    setGenLoading(true);
    setSampledStrings([]);
    setSampleMessage('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regex, maxLength: GENERATE_MAX_LENGTH }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGroupedStrings(data.groupedStrings);
      setAllStrings(data.allStrings || []);
    } catch (e) {
      setGroupedStrings(null);
      setAllStrings([]);
      setGenError(e.message);
    } finally {
      setGenLoading(false);
    }
  }

  async function handleSampleMore() {
    if (groupedStrings === null) return;
    setSampleLoading(true);
    setSampleMessage('');
    try {
      const res = await fetch('/api/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regex,
          maxLength: SAMPLE_MAX_LENGTH,
          existingStrings: allStrings,
          sampledStrings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sampling failed');
      if (data.message) {
        setSampleMessage(data.message);
      }
      if (data.newSamples?.length) {
        setSampledStrings((prev) => [...prev, ...data.newSamples]);
      }
    } catch (e) {
      setSampleMessage(e.message);
    } finally {
      setSampleLoading(false);
    }
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', marginTop: 0, maxWidth: '52rem' }}>
        Explore a restricted regex algebra: literals, <code style={{ fontFamily: 'var(--font-mono)' }}>|</code>,{' '}
        <code style={{ fontFamily: 'var(--font-mono)' }}>*</code>, and parentheses. <strong>Generate strings</strong>{' '}
        lists every member up to length {GENERATE_MAX_LENGTH}; use <strong>Generate 5 more examples</strong> for
        additional samples (up to length {SAMPLE_MAX_LENGTH}), avoiding duplicates with that listing.
      </p>
      <div className="panel-grid">
        <GeneratorPanel
          regex={regex}
          onRegexChange={setRegex}
          onGenerate={handleGenerate}
          genLoading={genLoading}
          genError={genError}
          groupedStrings={groupedStrings}
          onSampleMore={handleSampleMore}
          sampleLoading={sampleLoading}
          sampledStrings={sampledStrings}
          sampleMessage={sampleMessage}
        />
        <MembershipPanel regex={regex} />
        <EquivalencePanel />
      </div>
    </div>
  );
}
