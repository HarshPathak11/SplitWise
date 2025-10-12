import React, { useEffect, useState } from "react";

const FeedbackResponses = () => {
  const [data, setData] = useState([]);
  const [token, setToken] = useState(null);

  const CLIENT_ID = import.meta.env.VITE_REACT_APP_OAUTH_CLIENT_ID; // OAuth client ID
  const SPREADSHEET_ID = import.meta.env.VITE_REACT_APP_SPREADSHEET_ID;
  const SHEET_NAME = import.meta.env.VITE_REACT_APP_SHEET_NAME;

  useEffect(() => {
    // Load the GIS script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = initializeTokenClient;
    document.body.appendChild(script);
  }, []);

  let tokenClient;

  const initializeTokenClient = () => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      callback: (response) => {
        setToken(response.access_token); // THIS IS THE ACCESS TOKEN
        fetchData(response.access_token);
      },
    });

    // Create a manual “Sign In” button
    const btn = document.createElement("button");
    btn.innerText = "Sign in with Google";
    btn.onclick = () => tokenClient.requestAccessToken();
    document.getElementById("googleSignInButton").appendChild(btn);
  };

  const fetchData = async (accessToken) => {
    try {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A1:Z1000`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const json = await res.json();
      setData(json.values || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Feedback Responses</h1>
      {!token && <div id="googleSignInButton"></div>}

      {data.length > 0 && (
        <table className="border border-gray-300 mt-4">
          <thead>
            <tr>
              {data[0].map((header, idx) => (
                <th key={idx} className="border px-2 py-1">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cidx) => (
                  <td key={cidx} className="border px-2 py-1">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeedbackResponses;
