import React, { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { pauseImg, playImg, replayImg } from "../utils";
import { useGSAP } from "@gsap/react";
const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });
  const [loadedData, setloadedData] = useState([]);
  useGSAP(() => {
    gsap.to("#slider", {
      transform: `translateX(${-100 * video.videoId}% )`,
      duration: 2,
      ease: "power2.inOut",
    });

    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [video.isEnd, video.videoId]);
  useEffect(() => {
    if (loadedData.length > 3) {
      if (!video.isPlaying) {
        videoRef.current[video.videoId].pause();
      } else {
        console.log("ranana");
        video.startPlay && videoRef.current[video.videoId].play();
      }
    }
  }, [video.startPlay, video.videoId, video.isPlaying, loadedData]);

  const handleLoadedMetaData = (i, e) => setloadedData((prev) => [...prev, e]);
  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[video.videoId]) {
      let anim = gsap.to(span[video.videoId], {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);
          if (progress != currentProgress) {
            currentProgress = progress;
            gsap.to(videoDivRef.current[video.videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw"
                  : window.innerWidth < 1200
                  ? "10vw"
                  : "4vw",
            });
            gsap.to(span[video.videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },
        onComplete: () => {
          if (video.isPlaying) {
            gsap.to(videoDivRef.current[video.videoId], {
              width: "12px",
            });
            gsap.to(span[video.videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });
      if (video.videoId === 0) {
        anim.restart();
      }
      const animUpdate = () => {
        anim.progress(
          videoRef.current[video.videoId].currentTime /
            hightlightsSlides[video.videoId].videoDuration
        );
      };

      if (video.isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [video.videoId, video.startPlay, video.isPlaying]);
  const handleProcess = (type, i) => {
    console.log("rab");
    switch (type) {
      case "video-end":
        setVideo((prev) => ({ ...prev, isEnd: true, videoId: i + 1 }));
        console.log("ran inside");
        break;
      case "video-last":
        setVideo((prev) => ({ ...prev, isLastVideo: true }));
        break;
      case "video-reset":
        setVideo((prev) => ({ ...prev, isLastVideo: false, videoId: 0 }));
        break;
      case "play":
        setVideo((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
        break;
      case "pause":
        setVideo((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
        break;
      default:
        return video;
    }
  };
  return (
    <>
      <div className="flex items-center ">
        {hightlightsSlides.map((list, index) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                  key={list.id}
                  playsInline={true}
                  id="video"
                  preload="auto"
                  muted
                  ref={(el) => (videoRef.current[index] = el)}
                  className={`${
                    list.id === 2 && "translate-x-44"
                  } pointer-events-none`}
                  onPlay={() => {
                    setVideo((prev) => ({
                      ...prev,
                      isPlaying: true,
                    }));
                  }}
                  onLoadedMetadata={(e) => handleLoadedMetaData(index, e)}
                  onEnded={() =>
                    index !== 3
                      ? handleProcess("video-end", index)
                      : handleProcess("video-last")
                  }
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>
              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text) => (
                  <p className="md:text-2xl textxl font-md" key={text}>
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, index) => (
            <span
              key={index}
              ref={(el) => (videoDivRef.current[index] = el)}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <span
                className="absolute w-full h-full rounded-full"
                ref={(el) => (videoSpanRef.current[index] = el)}
              />
            </span>
          ))}
        </div>
        <button className="control-btn">
          <img
            src={
              video.isLastVideo
                ? replayImg
                : !video.isPlaying
                ? playImg
                : pauseImg
            }
            onClick={
              video.isLastVideo
                ? () => handleProcess("video-reset")
                : !video.isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
