import { Icon } from "./MeadowArt"
import type { AdventureId } from "./meadowState"

export function LocationArt({ id }: { id: AdventureId }) {
  return (
    <svg className="location-art" viewBox="0 0 400 190" aria-hidden="true">
      <g fill="white" opacity=".75">
        <path d="M24 48q-1-15 15-13 3-23 26-13 18-5 20 15 17-3 18 13Z" />
        <path d="M289 49q0-14 16-15 7-25 28-12 18-1 20 18 18 0 19 11Z" />
      </g>
      <circle cx="329" cy="40" r="21" fill="#f4d789" />
      <path d="M0 146Q80 92 175 143T400 139V190H0" fill="#c5dba9" />
      <path d="M0 173Q104 134 223 164T400 153V190H0" fill="#aaca91" />
      {id === "anger" && (
        <>
          <path d="m88 157 66-111 48 5 75 106Z" fill="#c7a69a" />
          <path
            d="m137 73 17-27 48 5 25 40-34-12-18 11-15-16Z"
            fill="#f0b19b"
          />
          <ellipse cx="178" cy="48" rx="25" ry="7" fill="#b58c7d" />
          <path
            d="M174 30q-10-9 2-17m17 18q12-13 1-23"
            fill="none"
            stroke="#ecd1c3"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect x="282" y="145" width="40" height="19" rx="5" fill="#d58e7a" />
          <circle cx="290" cy="165" r="5" fill="#777c63" />
          <circle cx="316" cy="165" r="5" fill="#777c63" />
        </>
      )}
      {id === "stress" && (
        <>
          <path d="m55 153 85-119 87 119Z" fill="#a9b99e" />
          <path d="m161 153 85-133 100 133Z" fill="#bec6b0" />
          <path d="m222 58 24-38 30 40-23-9-14 9Z" fill="#fbf9ec" />
          <path
            d="M225 168q-77-15-38-40t21-36"
            fill="none"
            stroke="#f5e8c6"
            strokeWidth="14"
          />
        </>
      )}
      {id === "sadness" && (
        <>
          <path
            d="M185 126q-75 25 9 38t-38 35"
            fill="none"
            stroke="#9ac4d8"
            strokeWidth="48"
          />
          <path
            d="m137 151 24 2m39 15 26 3"
            fill="none"
            stroke="#e5f3f4"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M74 147V95" stroke="#9b9f75" strokeWidth="6" />
          <path d="M73 73q-45 22-13 44 21 19 42-2 22-35-29-42" fill="#a4bf91" />
        </>
      )}
      {id === "anxiety" && (
        <>
          <path
            d="M200 190q-40-25 10-45t-5-40"
            fill="none"
            stroke="#efe4cf"
            strokeWidth="16"
          />
          {[62, 128, 268, 336].map((x, i) => (
            <g key={x} transform={`translate(${x} ${158 - (i % 2) * 12})`}>
              <path d="M0 0v-26" stroke="#94806a" strokeWidth="7" />
              <path d="M0-100-32-24h64Z" fill={i % 2 ? "#b9a9d6" : "#a7bf95"} />
              <path d="M0-122-23-62h46Z" fill={i % 2 ? "#cdbfe5" : "#bad1a8"} />
            </g>
          ))}
          <path
            d="M168 70q-16-20 8-26 4-21 26-15 15-10 25 6 22 0 20 22 10 10-4 16Z"
            fill="#fbf8ff"
          />
          <path
            d="M186 58q4 4 8 0m14 0q4 4 8 0"
            fill="none"
            stroke="#8e83a4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "happiness" && (
        <>
          <path d="m70 162 115-130 125 130Z" fill="#ead9a8" />
          <path d="m158 62 27-30 29 32-15-6-14 9-13-8Z" fill="#fffaf0" />
          {[
            [185, 18, 1],
            [150, 34, 0.7],
            [222, 30, 0.8],
          ].map(([x, y, s]) => (
            <path
              key={x}
              transform={`translate(${x} ${y}) scale(${s})`}
              d="M0-11 3-3 11 0 3 3 0 11-3 3-11 0-3-3Z"
              fill="#f2c34f"
            />
          ))}
          <g transform="translate(305 160)">
            <path d="M0 0v-30" stroke="#7fa46a" strokeWidth="5" />
            <path d="M0-20q-22-4-20-16 16-2 20 16" fill="#9cc083" />
            <path d="M0-26q20-6 20-18-16 0-20 18" fill="#9cc083" />
          </g>
        </>
      )}
    </svg>
  )
}

export function RewardArt({ art }: { art: string }) {
  return (
    <svg viewBox="0 0 150 130" className="reward-art" aria-hidden="true">
      {art === "flower" && (
        <>
          <path
            d="M76 72v47m0-22q-34-12-27-23 25 3 27 23m0 11q29-9 23-24-22 1-23 24"
            fill="#9eb87b"
            stroke="#8ca56e"
            strokeWidth="3"
          />
          {[0, 60, 120].map((r) => (
            <ellipse
              key={r}
              cx="75"
              cy="49"
              rx="16"
              ry="36"
              fill="#f1d17b"
              transform={`rotate(${r} 75 49)`}
            />
          ))}
          <circle cx="75" cy="49" r="17" fill="#b5a070" />
          <path
            d="M68 51q7 8 14 0"
            fill="none"
            stroke="#5e6650"
            strokeWidth="2"
          />
        </>
      )}
      {art === "crown" && (
        <>
          <path
            d="m34 61 13 35h61l11-35-28 15-16-26-15 27Z"
            fill="#b4cb8f"
            stroke="#8fa76c"
            strokeWidth="3"
          />
          {[40, 75, 111].map((x) => (
            <path
              key={x}
              d={`M${x} 62q-18-22 0-32 19 12 0 32`}
              fill="#9fb97b"
            />
          ))}
          <path d="M50 95h53" stroke="#e7c570" strokeWidth="6" />
        </>
      )}
      {art === "rainbow" && (
        <>
          {["#e9b5a8", "#f0d58e", "#aec5a0", "#b4c8db", "#c8b6d8"].map(
            (c, i) => (
              <path
                key={c}
                d={`M${28 + i * 9} 100a${47 - i * 9} ${47 - i * 9} 0 0 1 ${94 - i * 18} 0`}
                fill="none"
                stroke={c}
                strokeWidth="9"
              />
            ),
          )}
          <ellipse cx="31" cy="104" rx="26" ry="12" fill="#fffdf7" />
          <ellipse cx="119" cy="104" rx="26" ry="12" fill="#fffdf7" />
        </>
      )}
      {art === "cape" && (
        <>
          <path
            d="m53 35-25 78q47 20 96-2L98 35 76 49Z"
            fill="#baa5cf"
            stroke="#9c84b5"
            strokeWidth="3"
          />
          <path
            d="m72 68 5-10 5 10 12 1-9 8 2 12-10-6-10 6 2-12-9-8Z"
            fill="#f5dda0"
          />
          <path
            d="M55 35q21 20 43 0"
            fill="none"
            stroke="#e9d5ef"
            strokeWidth="9"
          />
        </>
      )}
    </svg>
  )
}

export function GroundingIcon({ kind }: { kind: string }) {
  if (kind === "flower" || kind === "star")
    return <Icon name={kind} size={42} />
  return (
    <svg
      viewBox="0 0 64 64"
      width="42"
      height="42"
      fill="none"
      aria-hidden="true"
    >
      {kind === "cloud" ? (
        <path
          d="M11 45q-11-18 7-22 2-20 21-13 16-2 17 17 17 7 3 19Z"
          fill="#fcfcff"
          stroke="#a6bbcf"
          strokeWidth="2"
        />
      ) : kind === "tree" ? (
        <>
          <path d="M32 32v27" stroke="#9b9f75" strokeWidth="5" />
          <path
            d="M32 5q-28 0-23 26 2 21 24 14 26 6 24-17Q55 4 32 5"
            fill="#a9c593"
          />
        </>
      ) : (
        <>
          <circle cx="47" cy="16" r="9" fill="#efd58b" />
          <path d="M3 53 25 16l17 27 8-12 13 22Z" fill="#b1c99a" />
        </>
      )}
    </svg>
  )
}
