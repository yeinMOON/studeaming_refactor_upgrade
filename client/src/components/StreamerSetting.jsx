import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { notification } from "antd";
import "antd/dist/antd.css";
import { modalOff } from "../store/actions";
import useAudio from "../hooks/useAudio";
import { v4 } from "uuid";
import studyroomAPI from "../api/studyroom";
import Loading from "./Loading";
import { Input, Desc } from "../styles/reusableStyle";
import sound from "../assets/sound";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 10px 20px;
  margin-top: 5px;
  position: relative;

  #studeaming-setting-title {
    color: var(--color-main-100);
    font-weight: 600;
    font-size: 1.2rem;
  }

  #studeaming-warning-message {
    color: var(--color-destructive);
    font-size: 0.8rem;
    margin-left: 0.8rem;
  }

  #info-setting {
    display: flex;
    gap: 2rem;
  }

  #sound-cards {
    display: flex;
    gap: 1rem;
  }

  #video-container {
    width: 500px;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      font-size: 14px;
      color: var(--color-black-50);
    }
  }
`;

const LiveVideo = styled.video`
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg); /* safari */
  -moz-transform: rotateY(180deg); /* firefox */
`;

const ThumbnailLabel = styled.label`
  width: 360px;
  height: 240px;
  border: 1px dashed var(--color-black-50);
  font-size: 12px;
  color: #8d8d8d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 16px;
  + input {
    display: none;
  }
`;

const Thumbnail = styled.div`
  width: 360px;
  height: 240px;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  #remove-thumbnail-btn {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    color: transparent;
    font-size: 24px;
    :hover {
      transition: 0.3s;
      background-color: rgba(0, 0, 0, 0.3);
      color: #f5f5f5;
    }
  }
`;

const SoundCard = styled.div`
  width: 150px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  color: white;
  font-weight: 600;
  box-shadow: ${(props) =>
    props.isSelected && "0px 0px 10px var(--color-black-25)"};
  border-radius: 10px;
  cursor: pointer;

  :after {
    content: "";
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    background-image: url(${(props) => props.img});
    background-size: cover;
    background-position: center;
    border-radius: 10px;
    opacity: 0.7;
    z-index: -1;
  }

  :hover {
    opacity: 0.8;
  }
`;

const StartBtn = styled.button`
  position: absolute;
  bottom: 15px;
  right: 15px;
  width: 120px;
  height: 50px;
  border-radius: 10px;
  color: ${(props) => (props.isActive ? "white" : "#ececec")};
  background-color: ${(props) => (props.isActive ? "#7a7ef4" : "#8c8ca3")};
  text-align: center;
  font-size: 0.9rem;

  cursor: ${(props) => (props.isActive ? "pointer" : "not-allowed")};

  :hover {
    background-color: ${(props) => (props.isActive ? "#656bff" : "#8c8ca3")};
  }
`;

function StreamerSettingMockup() {
  const { username } = useSelector(({ userReducer }) => userReducer);
  const [streamingInfo, setStreamingInfo] = useState({
    title: "",
    thumbnail: null,
    sound: "",
  });
  const [imageUrl, setImageUrl] = useState(null);
  const localVideoRef = useRef(HTMLVideoElement);
  const formData = useRef();
  const [players, toggle] = useAudio(sound);
  const [hover, setHover] = useState({ mounted: false, idx: null });
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let localStream;

  const checkCameraHandler = async () => {
    try {
      const constraints = {
        audio: false,
        video: {
          width: 500,
          height: 330,
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream = stream;
      setIsActive(true);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      notification.open({
        message: (
          <div style={{ fontSize: "1rem" }}>카메라를 인식하지 못했습니다.</div>
        ),
        description: (
          <div style={{ fontSize: "0.8rem" }}>
            새로고침 후 다시 시도해주세요.
          </div>
        ),
      });
    }
  };

  const getTitle = (event) => {
    setStreamingInfo({ ...streamingInfo, title: event.target.value });
  };

  const getThumbnail = (event) => {
    const src = event.target.files[0];
    setStreamingInfo({ ...streamingInfo, thumbnail: src });
    setImageUrl(URL.createObjectURL(src));
  };

  const removeThumbnail = () => {
    setStreamingInfo({ ...streamingInfo, thumbnail: null });
    setImageUrl(null);
  };

  const getSound = (ASMR, idx) => {
    setStreamingInfo({ ...streamingInfo, sound: ASMR, idx: idx });
  };

  const hoverHandler = (idx) => {
    setHover({ mounted: true, idx });
  };

  const startBtnHandler = () => {
    setIsLoading(true);

    if (isActive) {
      let title = streamingInfo.title,
        sound = streamingInfo.sound;
      const uuid = v4();
      const now = Date.now();
      if (!streamingInfo.title.length) {
        title = `${username}의 스터디밍에 참여하세요!`;
      }
      if (!streamingInfo.sound.length) {
        sound = "fire";
      }

      formData.current = new FormData();
      formData.current.append("title", title);
      formData.current.append("uuid", uuid);
      formData.current.append("profile_img", streamingInfo.thumbnail);

      studyroomAPI
        .postStudyRoom(formData.current)
        .then((res) => {
          setIsLoading(false);
          dispatch(modalOff());
          navigate("/streamer", {
            state: { uuid, title, sound, createdAt: now },
          });
        })
        .catch((err) => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    checkCameraHandler();
    return () => {
      setIsLoading(false);
      if (localStream) {
        localStream.getTracks()[0].stop();
      }
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (hover.mounted) {
      toggle(hover.idx);
    }
    // eslint-disable-next-line
  }, [hover]);

  return (
    <>
      {isLoading ? <Loading></Loading> : null}
      <Container>
        <div>
          <span id="studeaming-setting-title">스트리밍 시작하기</span>
          <span id="studeaming-warning-message">
            ❗️부적절한 영상 송출시 스트리밍 또는 모든 서비스 이용이 제한될 수
            있습니다.
          </span>
        </div>
        <div id="info-setting">
          <div id="video-container">
            {isActive && <LiveVideo autoPlay ref={localVideoRef} />}
            {!isActive && (
              <span>
                브라우저 상단 탭에서 카메라 접근 권한을 허용한 뒤 다시
                시도해주세요
              </span>
            )}
          </div>
          <div id="info-input">
            <Desc>제목을 입력하세요</Desc>
            <Input onBlur={getTitle} />
            <Desc>썸네일을 선택하세요</Desc>
            {imageUrl ? (
              <Thumbnail onClick={removeThumbnail}>
                <img src={imageUrl} alt="thumbnail" />
                <div id="remove-thumbnail-btn">&times;</div>
              </Thumbnail>
            ) : (
              <div className="upload-thumbnail">
                <ThumbnailLabel htmlFor="thumbnail-input">
                  썸네일 업로드하기
                </ThumbnailLabel>
                <input
                  id="thumbnail-input"
                  type="file"
                  accept="image/*"
                  onChange={getThumbnail}
                ></input>
              </div>
            )}
          </div>
        </div>
        <div id="sound-picker">
          <Desc>
            ASMR 사운드를 선택하세요. 마우스를 올리면 사운드가 재생됩니다.
          </Desc>
          <div id="sound-cards">
            {players.map((ASMR, idx) => {
              return (
                <SoundCard
                  key={idx}
                  img={ASMR.img}
                  isSelected={ASMR.keyword === streamingInfo.sound}
                  onClick={() => getSound(ASMR.keyword, idx)}
                  onMouseEnter={() => hoverHandler(idx)}
                  onMouseLeave={() => hoverHandler(idx)}
                >
                  <div className="ASMR-title">{ASMR.title}</div>
                </SoundCard>
              );
            })}
          </div>
        </div>
        <StartBtn isActive={isActive} onClick={startBtnHandler}>
          방송 시작
        </StartBtn>
      </Container>
    </>
  );
}

export default StreamerSettingMockup;
