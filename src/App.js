// App.js 전체 코드
import React, { useState, useRef } from "react";
import { Radar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function App() {
  const [page, setPage] = useState(0);
  const [plaqueScores, setPlaqueScores] = useState(Array(6).fill(0));
  const [perioInputs, setPerioInputs] = useState(Array(24).fill(""));
  const [interdentalScores, setInterdentalScores] = useState(Array(4).fill(0));
  const [sensitivityScore, setSensitivityScore] = useState(0);
  const [archScore, setArchScore] = useState(0);
  const [motorScore, setMotorScore] = useState(0);
  const [name, setName] = useState("");
  const [chartNumber, setChartNumber] = useState("");
  const [date, setDate] = useState("");
  const resultRef = useRef(null);
  const handlePlaqueClick = (index, level) => {
    const updated = [...plaqueScores];
    updated[index] = level;
    setPlaqueScores(updated);
  };

  const getPerioScore = () => {
    return perioInputs.reduce((sum, val) => {
      const n = parseInt(val);
      if (!isNaN(n)) {
        if (n <= 3) return sum;
        else if (n <= 5) return sum + 1;
        else return sum + 2;
      }
      return sum;
    }, 0);
  };

  const hasPerio6mm = () => {
    return perioInputs.some((val) => parseInt(val) > 5);
  };

  const maxScores = {
    plaque: 18,
    perio: 48,
    interdental: 12,
    sensitivity: 3,
    arch: 2,
    motor: 1,
  };

  const actualScores = {
    plaque: plaqueScores.reduce((a, b) => a + b, 0),
    perio: getPerioScore(),
    interdental: interdentalScores.reduce((a, b) => a + b, 0),
    sensitivity: sensitivityScore,
    arch: archScore,
    motor: motorScore,
  };

  const totalScore = Object.values(actualScores).reduce((a, b) => a + b, 0);
  const totalMax = Object.values(maxScores).reduce((a, b) => a + b, 0);
  const totalPercent = ((totalScore / totalMax) * 100).toFixed(1);

  const isWarning = {
    plaque: actualScores.plaque > 6,
    perio: hasPerio6mm(),
    interdental: interdentalScores.some((v) => v >= 2),
    sensitivity: sensitivityScore >= 2,
    arch: archScore === 2,
    motor: motorScore === 1,
  };

  const warningLabels = {
    plaque: "치면세정능력",
    perio: "치주건강도",
    interdental: "치간관리",
    sensitivity: "민감성",
    arch: "악궁 크기",
    motor: "손 운동기능",
  };

  const warningItems = Object.entries(isWarning)
    .filter(([_, v]) => v)
    .map(([key]) => warningLabels[key]);

  const radarData = {
    labels: [
      isWarning.plaque ? "치면세정능력 ⚠️" : "치면세정능력",
      isWarning.perio ? "치주건강도 ⚠️" : "치주건강도",
      isWarning.interdental ? "치간관리 ⚠️" : "치간관리",
      isWarning.sensitivity ? "민감성 ⚠️" : "민감성",
      isWarning.arch ? "악궁크기 ⚠️" : "악궁크기",
      isWarning.motor ? "손 운동기능 ⚠️" : "손 운동기능",
    ],
    datasets: [
      {
        label: "구강 상태 점수 (100점 만점 환산)",
        data: [
          (actualScores.plaque / maxScores.plaque) * 100,
          (actualScores.perio / maxScores.perio) * 100,
          (actualScores.interdental / maxScores.interdental) * 100,
          (actualScores.sensitivity / maxScores.sensitivity) * 100,
          (actualScores.arch / maxScores.arch) * 100,
          (actualScores.motor / maxScores.motor) * 100,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        pointBackgroundColor: [
          isWarning.plaque ? "red" : "black",
          isWarning.perio ? "red" : "black",
          isWarning.interdental ? "red" : "black",
          isWarning.sensitivity ? "red" : "black",
          isWarning.arch ? "red" : "black",
          isWarning.motor ? "red" : "black",
        ],
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  const captureResultAsImage = async () => {
    if (!resultRef.current) return;
    const canvas = await html2canvas(resultRef.current);
    const ctx = canvas.getContext("2d");
    const watermark = new Image();
    watermark.src = process.env.PUBLIC_URL + "/watermark.png";
    await new Promise((res) => {
      watermark.onload = res;
    });
    const scale = 0.25;
    const wmWidth = canvas.width * scale;
    const wmHeight = (watermark.height / watermark.width) * wmWidth;
    const x = (canvas.width - wmWidth) / 2;
    const y = (canvas.height - wmHeight) / 2;
    ctx.globalAlpha = 0.25;
    ctx.drawImage(watermark, x, y, wmWidth, wmHeight);
    ctx.globalAlpha = 1.0;
    const link = document.createElement("a");
    link.download = `oral_hygiene_result_${name || "patient"}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };
  const renderPage = () => {
    if (page === 0) {
      return (
        <div style={{ textAlign: "center", marginTop: 100 }}>
          <h1 style={{ fontSize: 28 }}>
            치과위생사와 함께하는 구강위생용품 진단 프로그램
          </h1>
          <p>치과위생사 이주화 제작</p>
          <button
            onClick={() => setPage(1)}
            style={{ marginTop: 40, fontSize: 22 }}
          >
            진단하기
          </button>
        </div>
      );
    }

    if (page === 1) {
      return (
        <div>
          <h2>진단 정보 입력</h2>
          <label>
            환자 이름:{" "}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ fontSize: 20 }}
            />
          </label>
          <br />
          <label>
            차트 번호:{" "}
            <input
              value={chartNumber}
              onChange={(e) => setChartNumber(e.target.value)}
              style={{ fontSize: 20 }}
            />
          </label>
          <br />
          <label>
            진단 날짜:{" "}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ fontSize: 20 }}
            />
          </label>
          <br />
          <button onClick={() => setPage(0)} style={{ marginTop: 20 }}>
            이전
          </button>
          <button onClick={() => setPage(2)} style={{ marginLeft: 20 }}>
            다음
          </button>
        </div>
      );
    }

    if (page === 2) {
      const teeth = [12, 16, 24, 26, 32, 44];
      const levels = [
        "치은연에만 침착 (1점)",
        "치은연보다 넓게 침착 (2점)",
        "협면 전반적 침착 (3점)",
      ];
      return (
        <div>
          <h2>1. 치면세정 능력 검사</h2>
          <p>치식번호를 참고하여 각 부위의 플라그 침착 정도를 선택하세요.</p>
          <h4>상악 (12, 16, 24, 26)</h4>
          <table
            border={1}
            cellPadding={10}
            style={{ margin: "auto", fontSize: 18 }}
          >
            <thead>
              <tr>
                {teeth.slice(0, 4).map((t) => (
                  <th key={t}>#{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {plaqueScores.slice(0, 4).map((score, idx) => (
                  <td key={idx}>
                    {levels.map((label, levelIdx) => (
                      <div key={levelIdx}>
                        <label>
                          <input
                            type="radio"
                            name={`plaque-${idx}`}
                            checked={score === levelIdx + 1}
                            onChange={() =>
                              handlePlaqueClick(idx, levelIdx + 1)
                            }
                          />
                          {label}
                        </label>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <h4 style={{ marginTop: 30 }}>하악 (32, 44)</h4>
          <table
            border={1}
            cellPadding={10}
            style={{ margin: "auto", fontSize: 18 }}
          >
            <thead>
              <tr>
                {teeth.slice(4).map((t) => (
                  <th key={t}>#{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {plaqueScores.slice(4).map((score, idx) => (
                  <td key={idx + 4}>
                    {levels.map((label, levelIdx) => (
                      <div key={levelIdx}>
                        <label>
                          <input
                            type="radio"
                            name={`plaque-${idx + 4}`}
                            checked={score === levelIdx + 1}
                            onChange={() =>
                              handlePlaqueClick(idx + 4, levelIdx + 1)
                            }
                          />
                          {label}
                        </label>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 30 }}>
            <button onClick={() => setPage(1)}>이전</button>
            <button onClick={() => setPage(3)} style={{ float: "right" }}>
              다음
            </button>
          </div>
        </div>
      );
    }
    if (page === 3) {
      return (
        <div>
          <h2>2. 치주건강도 검사</h2>
          <p>
            측정 치아: #16,17,26,27,36,37,46,47 (buccal 측 mesial / mid /
            distal)
          </p>
          <p>probing 후 깊이를 입력하면 자동으로 점수가 환산됩니다.</p>
          <p>(점수 기준: 0점 = 3mm 이하, 1점 = 4~5mm, 2점 = 6mm 이상)</p>
          <table border={1} style={{ margin: "auto", fontSize: 18 }}>
            <thead>
              <tr>
                <th>치아</th>
                <th>Mesial</th>
                <th>Mid</th>
                <th>Distal</th>
              </tr>
            </thead>
            <tbody>
              {[16, 17, 26, 27, 36, 37, 46, 47].map((t, idx) => (
                <tr key={t}>
                  <td>#{t}</td>
                  {[0, 1, 2].map((pos) => (
                    <td key={pos}>
                      <input
                        type="number"
                        min={0}
                        value={perioInputs[idx * 3 + pos]}
                        onChange={(e) => {
                          const updated = [...perioInputs];
                          updated[idx * 3 + pos] = e.target.value;
                          setPerioInputs(updated);
                        }}
                        style={{ width: 50, fontSize: 18 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 30 }}>
            <button onClick={() => setPage(2)}>이전</button>
            <button onClick={() => setPage(4)} style={{ float: "right" }}>
              다음
            </button>
          </div>
        </div>
      );
    }

    if (page === 4) {
      return (
        <div>
          <h2>3. 치간 점수 입력</h2>
          <p>점수 기준:</p>
          <ul>
            <li>0점: 퇴축 없음(치간칫솔 삽입 어렵고 치실 사용 가능)</li>
            <li>1점: XS/S 치간칫솔 삽입 가능</li>
            <li>2점: M 치간칫솔 또는 식편압입 존재</li>
            <li>3점: L 치간칫솔 또는 블랙트라이앵글 관찰됨</li>
          </ul>
          {["#16-17", "#26-27", "#36-37", "#46-47"].map((label, idx) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <label>
                {label}:{" "}
                <input
                  type="number"
                  min={0}
                  max={3}
                  value={interdentalScores[idx]}
                  onChange={(e) => {
                    const updated = [...interdentalScores];
                    updated[idx] = parseInt(e.target.value);
                    setInterdentalScores(updated);
                  }}
                  style={{ width: 50, fontSize: 18 }}
                />
              </label>
            </div>
          ))}
          <div style={{ marginTop: 30 }}>
            <button onClick={() => setPage(3)}>이전</button>
            <button onClick={() => setPage(5)} style={{ float: "right" }}>
              다음
            </button>
          </div>
        </div>
      );
    }

    if (page === 5) {
      return (
        <div>
          <h2>4. 민감성 검사</h2>
          <p>점수 기준:</p>
          <ul>
            <li>0점: 진행된 치경부 마모증과 시린 증상 모두 없음</li>
            <li>1점: 시린 증상만 있음</li>
            <li>2점: 치경부 마모증은 있으나 시린증상은 없음</li>
            <li>3점: 치경부 마모와 시린 증상 둘 다 있음</li>
          </ul>
          {[0, 1, 2, 3].map((val) => (
            <label key={val} style={{ display: "block", fontSize: 18 }}>
              <input
                type="radio"
                name="sensitivity"
                value={val}
                checked={sensitivityScore === val}
                onChange={() => setSensitivityScore(val)}
              />
              {val}점
            </label>
          ))}
          <div style={{ marginTop: 30 }}>
            <button onClick={() => setPage(4)}>이전</button>
            <button onClick={() => setPage(6)} style={{ float: "right" }}>
              다음
            </button>
          </div>
        </div>
      );
    }
    if (page === 6) {
      return (
        <div>
          <h2>5. 악궁의 크기 및 손 운동기능 평가</h2>

          <p>악궁의 크기 기준:</p>
          <ul>
            <li>0점: Large </li>
            <li>1점: Midium</li>
            <li>2점: Small (특별케어 필요)</li>
          </ul>
          {[0, 1, 2].map((val) => (
            <label key={val} style={{ display: "block", fontSize: 18 }}>
              <input
                type="radio"
                name="arch"
                value={val}
                checked={archScore === val}
                onChange={() => setArchScore(val)}
              />
              {val}점
            </label>
          ))}

          <p style={{ marginTop: 20 }}>손 운동기능 평가 기준:</p>
          <ul>
            <li>0점: 양호</li>
            <li>1점: 불량 (주의 필요)</li>
          </ul>
          {[0, 1].map((val) => (
            <label key={val} style={{ display: "block", fontSize: 18 }}>
              <input
                type="radio"
                name="motor"
                value={val}
                checked={motorScore === val}
                onChange={() => setMotorScore(val)}
              />
              {val}점
            </label>
          ))}

          <div style={{ marginTop: 30 }}>
            <button onClick={() => setPage(5)}>이전</button>
            <button onClick={() => setPage(7)} style={{ float: "right" }}>
              다음
            </button>
          </div>
        </div>
      );
    }

    // ⬇️ page 2~6은 이전에 전달한 코드에서 붙여넣으신 내용과 동일하게 유지

    if (page === 7) {
      return (
        <div ref={resultRef}>
          <h2>최종 결과 요약</h2>
          <p>
            <strong>환자명:</strong> {name}
          </p>
          <p>
            <strong>차트번호:</strong> {chartNumber}
          </p>
          <p>
            <strong>진단일자:</strong> {date}
          </p>
          <Radar data={radarData} options={radarOptions} />
          <p style={{ marginTop: 20 }}>
            <strong>총점:</strong> {totalScore} / {totalMax}점 ({totalPercent}%)
          </p>
          <ul>
            <li>치면세정 점수: {actualScores.plaque} / 18</li>
            <li>치주건강 점수: {actualScores.perio} / 48</li>
            <li>치간관리 점수: {actualScores.interdental} / 12</li>
            <li>시린이 점수: {actualScores.sensitivity} / 3</li>
            <li>악궁 사이즈: {actualScores.arch} / 2</li>
            <li>손 운동기능 점수: {actualScores.motor} / 1</li>
          </ul>
          {warningItems.length > 0 && (
            <div style={{ color: "red", marginTop: 20 }}>
              ⚠️ <strong>주의 요약:</strong> {warningItems.join(", ")} 항목에
              주의가 필요합니다.
            </div>
          )}
          <button onClick={() => setPage(6)} style={{ marginTop: 20 }}>
            이전으로
          </button>
          <button onClick={captureResultAsImage} style={{ marginLeft: 20 }}>
            이미지 저장
          </button>
        </div>
      );
    }

    return <div>페이지가 준비되지 않았습니다.</div>;
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontSize: 20 }}>
      {renderPage()}
    </div>
  );
}
