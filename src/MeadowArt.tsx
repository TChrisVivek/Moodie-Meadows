type Activity = "slide" | "garden" | "cloud" | "quiz"

export function Icon({ name, size = 22 }: { name: string, size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "home" ? (
        <>
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
          <path d="M9 21v-8h6v8" />
        </>
      ) : name === "star" ? (
        <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />
      ) : name === "book" ? (
        <>
          <path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1Z" />
          <path d="M12 5v15" />
        </>
      ) : name === "arrow" ? (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      ) : name === "check" ? (
        <path d="m5 12 4 4L19 6" />
      ) : name === "sound" ? (
        <>
          <path d="m11 4-6 5H2v6h3l6 5Z" />
          <path d="M15 8q5 4 0 8m3-11q8 7 0 14" />
        </>
      ) : name === "heart" ? (
        <path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 8 15 8 15S25 10 20 5Z" />
      ) : name === "flower" ? (
        <>
          <path d="M12 12v10m0-5q-8 0-6-5 5 0 6 5m0-1q8 0 6-5-5 0-6 5" />
          <circle cx="12" cy="7" r="5" />
          <circle cx="12" cy="7" r="1" />
        </>
      ) : (
        <path d="m8 5 7 7-7 7" />
      )}
    </svg>
  )
}

export function Buddy({
  mood = "happy",
  color = "#f7cd64",
  kind = "blob",
}: {
  mood?: string
  color?: string
  kind?: string
}) {
  return (
    <svg
      viewBox="0 0 180 180"
      className={`buddy mood-${mood}`}
      aria-hidden="true"
    >
      <ellipse cx="90" cy="160" rx="51" ry="9" fill="#365643" opacity=".09" />
      {kind === "bunny" && (
        <g fill={color} stroke="#75689c" strokeWidth="2">
          <ellipse
            cx="65"
            cy="40"
            rx="16"
            ry="35"
            transform="rotate(-12 65 40)"
          />
          <ellipse
            cx="111"
            cy="37"
            rx="16"
            ry="35"
            transform="rotate(10 111 37)"
          />
          <path
            d="M65 22v30m46-31v29"
            stroke="#e4bdd8"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      )}
      <path
        d="M43 125Q26 97 43 74Q42 43 74 43Q99 27 124 51Q147 54 143 83Q163 108 140 133Q131 157 106 150L77 153Q46 158 43 125Z"
        fill={color}
      />
      <path
        d="m46 104-17 10m111-12 18-12M68 148l-8 12m53-13 8 12"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
      />
      <g fill="#4c514b">
        <ellipse cx="70" cy="91" rx="3.5" ry={mood === "calm" ? "1.5" : "5"} />
        <ellipse cx="108" cy="91" rx="3.5" ry={mood === "calm" ? "1.5" : "5"} />
      </g>
      <g fill="#ee9a98" opacity=".65">
        <ellipse cx="58" cy="105" rx="9" ry="5" />
        <ellipse cx="121" cy="105" rx="9" ry="5" />
      </g>
      {mood === "happy" ? (
        <path d="M77 106q13 22 25 0Z" fill="#704c43" />
      ) : mood === "sad" || mood === "worried" ? (
        <path
          d="M79 116q10-13 21 0"
          fill="none"
          stroke="#4c514b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M79 108q10 9 21 0"
          fill="none"
          stroke="#4c514b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {mood === "angry" && (
        <path d="m63 78 13 5m26 0 13-5" stroke="#4c514b" strokeWidth="3" />
      )}
      {mood === "sad" && <path d="M118 110q-8 12 0 12t0-12" fill="#84bbdc" />}
      <path d="m82 45 4-17q12-2 16 8l-15 9" fill="#8faf6d" />
    </svg>
  )
}

export function Scene({
  type,
  hero = false,
}: {
  type: Activity
  hero?: boolean
}) {
  return (
    <svg
      className={hero ? "hero-scene" : "activity-scene"}
      viewBox="0 0 500 270"
      aria-hidden="true"
    >
      <circle cx="398" cy="51" r="30" fill="#f7d985" />
      <g fill="#fff" opacity=".85">
        <path d="M35 61q0-18 18-15 10-28 31-12 23-5 26 19 18 0 17 13H35Z" />
        <path d="M333 75q-1-14 13-15 5-26 29-20 17 0 20 21 21-1 23 16Z" />
      </g>
      <path d="M0 196Q100 120 230 181T500 167V270H0" fill="#c5dca6" />
      <path d="M0 232Q130 175 267 225T500 213V270H0" fill="#aaca91" />
      <path
        d="M259 270q-58-41 21-57t2-34"
        fill="none"
        stroke="#f4e7bf"
        strokeWidth="25"
      />
      {type === "slide" && (
        <g strokeLinecap="round">
          <path
            d="M131 200V86m61 116V88M131 111h61m-61 25h61m-61 25h61m-61 24h61"
            stroke="#c99b72"
            strokeWidth="8"
          />
          <path
            d="M142 79h58c23 0 30 17 32 38 5 67 77 14 91 68 4 18 19 28 49 23"
            fill="none"
            stroke="#d88f7b"
            strokeWidth="26"
          />
          <path
            d="M142 73h58c23 0 30 17 32 38 5 67 77 14 91 68 4 18 19 28 49 23"
            fill="none"
            stroke="#f8bc9d"
            strokeWidth="19"
          />
          <path d="M112 73h96l-49-40Z" fill="#dba28d" />
          <g transform="translate(221 121) scale(.57)">
            <path
              d="M0 20Q-15-26 18-36q41-18 52 20T50 44Q4 54 0 20"
              fill="#f5d16b"
            />
            <circle cx="18" cy="0" r="3" fill="#4b5444" />
            <circle cx="42" cy="0" r="3" fill="#4b5444" />
            <path
              d="M22 14q9 10 17-1"
              fill="none"
              stroke="#4b5444"
              strokeWidth="3"
            />
          </g>
        </g>
      )}
      {type === "garden" && (
        <g>
          {[100, 165, 255, 340, 403].map((x, i) => (
            <g key={x} transform={`translate(${x} ${190 - (i % 2) * 35})`}>
              <path
                d="M0 0v47m0-18q-24 1-19-16 18 0 19 16m0 8q26-1 20-18-16 0-20 18"
                fill="#84a86b"
                stroke="#84a86b"
                strokeWidth="3"
              />
              {[0, 60, 120].map((r) => (
                <ellipse
                  key={r}
                  rx="12"
                  ry="26"
                  fill={i % 2 ? "#c4a7d9" : "#f2b0a4"}
                  transform={`rotate(${r})`}
                />
              ))}
              <circle r="12" fill="#f7d978" />
              <circle cx="-4" cy="-1" r="1.6" />
              <circle cx="4" cy="-1" r="1.6" />
              <path
                d="M-3 4q3 4 6 0"
                fill="none"
                stroke="#69614b"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </g>
      )}
      {type === "cloud" && (
        <g>
          <path
            d="M131 131q-9-38 30-44 5-51 53-40 24-26 50 2 45-9 47 37 43 2 35 44Z"
            fill="#fff"
            stroke="#e0eaf0"
            strokeWidth="3"
          />
          <path
            d="M205 101q6 7 12 0m27 0q6 7 12 0m-32 14q8 7 16 0"
            fill="none"
            stroke="#7c8d9d"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="m159 166-8 17m144-22 8 17m-73-25v24"
            stroke="#c1b6dc"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      )}
      {type === "quiz" && (
        <g>
          <path
            d="m155 174 19-88 109 18-17 89Z"
            fill="#f7e4ac"
            stroke="#d8c492"
            strokeWidth="3"
          />
          <path
            d="m174 86 59-13 105 23-55 8m-17 89 64-22 8-75"
            fill="#fff4d6"
            stroke="#d8c492"
            strokeWidth="3"
          />
          <path
            d="m283 104-17 89m-60-86-8 55m20-47 30 5m-33 10 29 5m-32 10 17 3"
            stroke="#bea7c8"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="350" cy="66" r="28" fill="#c5b0dd" />
          <text
            x="350"
            y="78"
            textAnchor="middle"
            fill="white"
            fontSize="36"
            fontFamily="sans-serif"
          >
            ?
          </text>
        </g>
      )}
      {[39, 79, 421, 462].map((x, i) => (
        <g key={x} transform={`translate(${x} ${230 + (i % 2) * 16})`}>
          <path d="M0 0v13" stroke="#729c69" strokeWidth="2" />
          <path
            d="M0-8q-11-8-8 2-8 8 3 7 5 10 8 0 12 0 4-8Z"
            fill={i % 2 ? "#fff4cf" : "#f5c5bc"}
          />
          <circle r="3" fill="#e9be67" />
        </g>
      ))}
    </svg>
  )
}
