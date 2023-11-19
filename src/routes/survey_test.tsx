import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

// 질문 제목
const QuestionTitle = styled.h3`
  font-family: "GmarketSansTTFBold";
  font-size: 24px; // 폰트 크기
  color: #333; // 폰트 색상
  margin-left: 30px;
  margin-bottom: 8px; // 제목 아래 여백
`;

// 선택지 컨테이너
const OptionsContainer = styled.div`
  display: flex; // flex 레이아웃 사용
  flex-direction: row; // 가로 방향 배열
  justify-content: start; // 왼쪽 정렬
  margin-left: 50px;
  margin-top: 2%;
  margin-bottom: 1%; // 컨테이너 하단 여백
`;

// 선택지
const OptionLabel = styled.label`
  display: inline-block; // 블록 레벨 요소로 변경
  margin-right: 70px; // 각 옵션 사이의 여백
  font-family: "GmarketSansTTFMedium";
  font-size: 20px; // 폰트 크기
  cursor: pointer; // 마우스 오버 시 커서 변경
`;

// 선택지 버튼
const RadioBoxInput = styled.input`
  width: 15px;
  height: 15px;
`;

// 제출하기 버튼
const StyledButton = styled.button`
  background-color: #b5e2e9; // 배경색
  color: white; // 텍스트 색상
  padding: 15px 32px; // 안쪽 여백
  border: none; // 테두리 없음
  border-radius: 30px; // 모서리 둥글게
  cursor: pointer; // 마우스 오버 시 커서 변경
  font-size: 16px; // 폰트 크기
  margin-top: 30px;
  margin-left: 30px;

  /* &:hover {
    background-color: #9dd0d8; // 호버 시 배경색 변경
  } */
`;

interface Question {
  id: number;
  text: string;
  options: string[];
  selectedOption: string;
}

const QUESTIONS_PER_PAGE = 5;

const Survey_test: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/v1/members/survey/1")
      .then((response) => {
        const loadedQuestions = response.data.map(
          (item: any, index: number) => ({
            id: index + 1,
            text: item.questions,
            options: item.answers,
            selectedOption: item.selectedAnswer,
          })
        );
        setQuestions(loadedQuestions);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handleAnswerChange = (questionId: number, selectedOption: string) => {
    const updatedQuestions = questions.map((question) =>
      question.id === questionId ? { ...question, selectedOption } : question
    );
    setQuestions(updatedQuestions);
  };

  const TOTAL_PAGES = 4;
  //const TOTAL_PAGES = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  //console.log("questions.length: " + questions.length);
  //console.log("QUESTIONS_PER_PAGE: " + QUESTIONS_PER_PAGE);

  const isPageComplete = () => {
    const startIndex = currentPage * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return questions
      .slice(startIndex, endIndex)
      .every((q) => q.selectedOption !== "");
  };

  const allAnswered = questions.every(
    (question) => question.selectedOption !== ""
  );

  const handleSubmit = () => {
    // const submittedAnswers = questions.map(({ id, selectedOption }) => ({
    //   id,
    //   selectedOption,
    // }));

    // console.log("제출된 답변:", submittedAnswers);
    // 여기에 서버로 데이터 전송하는 로직을 추가할 수 있습니다.

    // 모든 선택된 옵션을 하나의 문자열로 결합
    const surveyResult = questions
      .map((question) => question.selectedOption)
      .join(",");
    console.log("surveyResult: ", surveyResult); // 이 로그를 통해 surveyResult의 내용을 확인

    // 데이터를 서버에 POST
    axios
      .post(
        "http://localhost:3000/api/v1/members/survey/1",
        JSON.stringify({ surveyResult }), // 데이터를 JSON 문자열로 변환
        {
          headers: {
            "Content-Type": "application/json", // 헤더에 Content-Type 설정
          },
        }
      )
      .then((response) => {
        console.log("서버 응답:", response);
        // 성공적으로 제출되었을 때의 추가 동작(옵션)
      })
      .catch((error) => {
        console.error("Error posting data: ", error);
      });
  };

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      {questions
        .slice(
          currentPage * QUESTIONS_PER_PAGE,
          (currentPage + 1) * QUESTIONS_PER_PAGE
        )
        .map((question) => (
          <QuestionTitle key={question.id}>
            <p>{question.text}</p>
            {question.options.map((option) => (
              <OptionLabel key={option}>
                <RadioBoxInput
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={question.selectedOption === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                />
                {option}
              </OptionLabel>
            ))}
          </QuestionTitle>
        ))}
      {currentPage < TOTAL_PAGES - 1 && (
        <StyledButton onClick={handleNextPage} disabled={!isPageComplete()}>
          다음
        </StyledButton>
      )}
      {currentPage == 3 && (
        <StyledButton onClick={handleSubmit} disabled={!allAnswered}>
          제출
        </StyledButton>
      )}
    </div>
  );
};

export default Survey_test;