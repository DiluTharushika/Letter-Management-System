import { useState, useEffect } from "react";
import "./User.css";

const User = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    letter_date: "",
    address: "",
    details: "",
    subject_no: "",
    letter_type: "",
    sent_date: "", // ✅ added sent_date
  });

  // Fetch letters
  const fetchLetters = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/letters");
      if (!response.ok) throw new Error("Failed to fetch letters");
      const data = await response.json();
      setLetters(data);
    } catch (err) {
      console.error("Error fetching letters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();

    // Listen for updates from Show.jsx
    const handleLettersUpdated = () => fetchLetters();
    window.addEventListener("lettersUpdated", handleLettersUpdated);

    return () => {
      window.removeEventListener("lettersUpdated", handleLettersUpdated);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submit failed");

      alert("✅ Letter submitted");
      setFormData({
        letter_date: "",
        address: "",
        details: "",
        subject_no: "",
        letter_type: "",
        sent_date: "", // reset sent_date
      });

      fetchLetters();
    } catch (err) {
      alert("❌ Failed: " + err.message);
    }
  };

  return (
    <div className="user-container">
      <h2>Letter Submission</h2>

      <form onSubmit={handleSubmit}>
        <label>ලිපියේ දිනය</label>
        <input
          type="date"
          name="letter_date"
          value={formData.letter_date}
          onChange={(e) =>
            setFormData({ ...formData, letter_date: e.target.value })
          }
          required
        />

        <label>ලිපිනය</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />

        <label>ලිපියේ විස්තරය</label>
        <textarea
          name="details"
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          rows="3"
          required
        />

        <label>විෂය අංකය</label>
        <select
          name="subject_no"
          value={formData.subject_no}
          onChange={(e) =>
            setFormData({ ...formData, subject_no: e.target.value })
          }
          required
        >
           <option value="">-- Select Subject No --</option>
          <option value="SP/RD/ADM/01">SP/RD/ADM/01</option>
          <option value="SP/RD/ADM/02">SP/RD/ADM/02</option>
          <option value="SP/RD/ADM/03">SP/RD/ADM/03</option>
          <option value="SP/DRD/ACC/01">SP/DRD/ACC/01</option>
          <option value="SP/DRD/ACC/02">SP/DRD/ACC/02</option>
          <option value="SP/DRD/ACC/03">SP/DRD/ACC/03</option>
          <option value="SP/DRD/DEV/01">SP/DRD/DEV/01</option>
          <option value="SP/DRD/DEV/02">SP/DRD/DEV/02</option>
          <option value="SP/DRD/DEV/03">SP/DRD/DEV/03</option>
          <option value="SP/DRD/DEV/04">SP/DRD/DEV/04</option>
          <option value="SP/DRD/DEV/05">SP/DRD/DEV/05</option>
          <option value="SP/DRD/DEV/06">SP/DRD/DEV/06</option>
          <option value="SP/DRD/DEV/07">SP/DRD/DEV/07</option>
          <option value="SP/DRD/DEV/08">SP/DRD/DEV/08</option>
          <option value="SP/DRD/R.DEV/01">SP/DRD/R.DEV/01</option>
          <option value="SP/DRD/R.DEV/02">SP/DRD/R.DEV/02</option>
        </select>

        <label>Letter Type</label>
        <select
          name="letter_type"
          value={formData.letter_type}
          onChange={(e) =>
            setFormData({ ...formData, letter_type: e.target.value })
          }
          required
        >
          <option value="">තෝරන්න</option>
          <option value="Not Registered">සාමාන්‍ය තැපැල්</option>
          <option value="Registered">ලියාපදිංචි තැපැල්</option>
        </select>

        <label>ලිපිය යැවූ දිනය</label>
        <input
          type="date"
          name="sent_date"
          value={formData.sent_date}
          onChange={(e) =>
            setFormData({ ...formData, sent_date: e.target.value })
          }
        />

        <button type="submit">Submit</button>
      </form>

      <div className="summary-table">
        <h3>📋 Letters Summary</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>විෂය අංකය</th>
                <th>ලිපිය ලබා ගත් දිනය</th>
                <th>ලිපියට දැක් වූ ප්‍රතිචාරය</th>
                <th>ලිපිය යැවූ දිනය</th>
                <th>ලිපිය යැවූ ස්ථානය</th>
                <th>Letter Type</th>
              </tr>
            </thead>
            <tbody>
              {letters.length === 0 ? (
                <tr>
                  <td colSpan="6">No letters yet</td>
                </tr>
              ) : (
                letters.map((l) => (
                  <tr key={l.id}>
                    <td>{l.subject_no}</td>
                    <td>{l.letter_date ? l.letter_date.split("T")[0] : "-"}</td>
                    <td>{l.details}</td>
                    <td>{l.sent_date ? l.sent_date.split("T")[0] : "-"}</td> {/* ✅ updated */}
                    <td>{l.address}</td>
                    <td>{l.letter_type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default User;
