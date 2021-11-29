import { useState } from "react";
import styled from "styled-components";
import { AiOutlineSearch } from "react-icons/ai";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Slider from "../components/Slider";
import MainContents from "../components/MainContents";

const SearchSection = styled.section`
  display: flex;
  justify-content: space-between;
  padding: 50px 80px;

  > .input-box {
    position: relative;
  }

  @media screen and (max-width: 970px) {
    padding: 50px 20px;
  }
`;

const SearchInput = styled.input`
  width: 250px;
  height: 30px;
  background-color: #f8f8f8;
  border: none;
  outline: none;
  border-radius: 2rem;
  padding-left: 20px;
  font-size: 10px;
  ::placeholder {
    color: #bcbcbc;
  }
`;

const SearchIcon = styled(AiOutlineSearch)`
  position: absolute;
  top: 25%;
  right: 20px;
  cursor: pointer;
  font-size: 16px;
`;

const Filter = styled.select`
  border: none;
  outline: none;
  font-size: 10px;
`;

const NotContents = styled.section`
  padding-left: 80px;

  @media screen and (max-width: 768px) {
    padding-left: 30px;
  }
`;

function Main() {
  const [searchValue, SetSearchValue] = useState("");
  const filterOpt = ["시청자 순", "최신 순", "오래 공부한 순"];
  const [contents, setContents] = useState([""]);

  return (
    <>
      <Slider />
      <SearchSection>
        <div className="input-box">
          <SearchInput
            type="text"
            placeholder="주제, 스터디머 등으로 검색해보세요"
          ></SearchInput>
          <SearchIcon />
        </div>
        <Filter>
          {filterOpt.map((opt, idx) => (
            <option value={opt} key={idx}>
              {opt}
            </option>
          ))}
        </Filter>
      </SearchSection>
      {contents.length ? (
        <MainContents />
      ) : (
        <NotContents>
          <h2>현재 스터디밍이 없습니다...</h2>
        </NotContents>
      )}
    </>
  );
}

export default Main;
