import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { QRCodeCanvas } from "qrcode.react";
import PropTypes from "prop-types";

const FairFareCard = ({ user }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [last4, setLast4] = useState(""); // State for last4
  const [netBalance, setNetBalance] = useState(0); // State for net balance
  const [balanceMessage, setBalanceMessage] = useState(""); // State for balance message

  // Generate or retrieve last4 using cookies
  useEffect(() => {
    let storedLast4 = Cookies.get("last4");

    if (!storedLast4) {
      storedLast4 = Math.floor(1000 + Math.random() * 9000).toString();
      Cookies.set("last4", storedLast4); // Store in cookies
    }

    setLast4(storedLast4);
  }, []);

  // Calculate net balance
  useEffect(() => {
    const userFriends = user?.friends || [];
    if (userFriends && userFriends.length > 0) {
      const totalBalance = userFriends.reduce(
        (sum, friend) => sum + Number(friend.balance || 0),
        0
      );
      setNetBalance(totalBalance);

      if (totalBalance > 0) {
        setBalanceMessage(`Net Credit:`);
      } else if (totalBalance < 0) {
        setBalanceMessage(`Net Debt:`);
      } else {
        setBalanceMessage("All Settled");
      }
    } else {
      setBalanceMessage("No Friends Found");
    }
  }, []);

  const getInitials = (name) =>
    name
      ? name
          .trim()
          .split(" ")
          .map((word) => word[0]?.toUpperCase())
          .slice(0, 2)
          .join("")
      : "U";

  const fallbackQuotes = [
    "Believe in yourself.",
    "Every day is a fresh start.",
    "Progress, not perfection.",
    "You are your only limit.",
  ];

  const randomQuote =
    fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];

  const qrValue = user?.upiId
    ? `upi://pay?pa=${user?.upiId}&pn=${user?.username}&cu=INR&tn=Settling via FairFare`
    : randomQuote;
  return (
    <div
      className="col-span-1 relative cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="w-88 h-72 perspective">
        <div
          className={`relative w-90 h-full duration-700 z-1 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Side */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-600 text-white rounded-2xl p-6 shadow-2xl">
            <div className="text-lg font-bold tracking-widest uppercase mt-4 mb-2">
              FairFare Card
            </div>
            <div className="absolute top-4 right-4 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
              GOLD MEMBER
            </div>
            <div className="w-16 h-12 rounded-lg shadow-md flex items-center justify-center p-1">
              <svg viewBox="0 0 100 80" width="100%" height="100%">
                <rect
                  x="5"
                  y="5"
                  width="90"
                  height="70"
                  rx="10"
                  ry="10"
                  fill="#facc15"
                  stroke="#b45309"
                  strokeWidth="2"
                />
                <line
                  x1="5"
                  y1="30"
                  x2="95"
                  y2="30"
                  stroke="#78350f"
                  strokeWidth="2"
                />
                <line
                  x1="5"
                  y1="50"
                  x2="95"
                  y2="50"
                  stroke="#78350f"
                  strokeWidth="2"
                />
                <line
                  x1="35"
                  y1="5"
                  x2="35"
                  y2="75"
                  stroke="#78350f"
                  strokeWidth="2"
                />
                <line
                  x1="65"
                  y1="5"
                  x2="65"
                  y2="75"
                  stroke="#78350f"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex items-center mt-2 space-x-4 mb-1">
              <div className="w-10 h-10 bg-white text-indigo-700 rounded-full flex items-center justify-center font-bold text-md border-2 border-white shadow">
                {getInitials(user?.username)}
              </div>
              <div className="text-lg font-semibold tracking-wider uppercase">
                {user?.username}
              </div>
            </div>
            <div className="font-mono text-xl tracking-widest mb-2">
              1234 5688 9012 {last4}
            </div>
            <div className={`text-sm mb-4 text-white-700`}>
              <p>{balanceMessage}</p>
              <p className="font-semibold">
                ₹{Math.abs(netBalance).toFixed(2)}
              </p>
              <p className="italic text-xs text-gray-300 mt-2">
                &quot;Spend smart, split easy.&quot;
              </p>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute w-full h-full backface-hidden bg-gray-800 text-white rounded-2xl p-6 shadow-2xl transform rotate-y-180 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-2">
              {user?.upiId ? "Scan to Pay" : "Your Daily Motivation"}
            </h3>
            <QRCodeCanvas
              value={qrValue}
              size={150}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
            <p className="text-sm mt-3 text-center text-gray-300 px-2">
              {user?.upiId
                ? `Pay to ${user?.username}`
                : `Scan the above code for some motivation!`}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};
FairFareCard.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    upiId: PropTypes.string,
    createdAt: PropTypes.string,
    friends: PropTypes.arrayOf(
      PropTypes.shape({
        balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  }).isRequired,
};

export default FairFareCard;
