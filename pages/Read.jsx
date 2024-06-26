import "../src/App";
import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "../css/Read.css";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuItem,
  NavbarMenuToggle,
  NavbarBrand,
  Link,
  NavbarMenu,
} from "@nextui-org/react";
// import {Navbar, , NavbarContent, NavbarItem, , , , Link, Button} from "@nextui-org/react";

import { Slider } from "@nextui-org/react";
import { Base64 } from "js-base64";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useParams } from "react-router-dom";

import { themes } from "../components/themes";
function Read() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [title, setTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    isOpen: isContentModalOpen,
    onOpen: onContentModalOpen,
    onOpenChange: onContentModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isColorModalOpen,
    onOpen: onColorModalOpen,
    onOpenChange: onColorModalOpenChange,
  } = useDisclosure();
  const {
    isOpen: isFontModalOpen,
    onOpen: onFontModalOpen,
    onOpenChange: onFontModalOpenChange,
  } = useDisclosure();
  const [bookChapters, setBookChapters] = useState([]);
  const containerRef = useRef(null);
  const getSavedTheme = () => {
    return localStorage.getItem("selectedTheme") || "default";
  };
  const getSavedFont = () => {
    return localStorage.getItem("selectedFont") || "main-font-light";
  };
  const getSavedChapter = () => {
    const savedChapter = localStorage.getItem(`selectedChapter_${id}`);
    return savedChapter !== null ? parseInt(savedChapter) : 0;
  };
  const [selectedTheme, setSelectedTheme] = useState(getSavedTheme);
  const [selectedFont, setSelectedFont] = useState(getSavedFont());
  const [selectedChapter, setSelectedChapter] = useState(getSavedChapter());
  const handleChangeTheme = (event) => {
    const theme = event.target.value;
    setSelectedTheme(theme);
    localStorage.setItem("selectedTheme", theme);
  };
  const handleChangeFont = (event) => {
    const font = event.target.value;
    setSelectedFont(font);
    localStorage.setItem("selectedFont", font);
  };
  const handleChangeChapter = (index) => {
    setSelectedChapter(index);
    localStorage.setItem(`selectedChapter_${id}`, index);
  };
  const handleChangeFontSize = (value) => {
    setFontSize(value);
    localStorage.setItem("fontSize", value);
  };
  const handleChangeContainerSize = (value) => {
    setContainerSize(value);
    localStorage.setItem("containerSize", value);
  };
  const themeStyles = themes[selectedTheme];
  const hasNextChapter = selectedChapter < bookChapters.length - 1;
  const hasPreviousChapter = selectedChapter > 0;
  const getSavedFontSize = () => {
    return localStorage.getItem("fontSize") || 18;
  };
  const getSavedContainerSize = () => {
    return localStorage.getItem("containerSize") || "800";
  };
  const [fontSize, setFontSize] = useState(getSavedFontSize());
  const [containerSize, setContainerSize] = useState(getSavedContainerSize());
  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(
          `https://avalanche.books.sharpleaf.biz.ua/nodeapi?id=${id}`
        );
        const data = await response.json();
        const foundBook = data[id - 1];
        if (foundBook) {
          setBook(foundBook.fb2path);
          setTitle(foundBook.title);
        } else {
          console.log("Book not found");
        }
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    }

    fetchBook();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!book) return;
    console.log(`https://sharpleaf.biz.ua/${book}`);
    fetch(`https://sharpleaf.biz.ua/${book}`)
      .then((response) => response.text())
      .then((fb2Text) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(fb2Text, "text/xml");
        const images = xmlDoc.querySelectorAll("image");
        if (images.length > 0) {
          console.log("Found image tags");
          images.forEach((image) => {
            const href = image.getAttribute("l:href");
            const binary = xmlDoc.querySelector(
              `binary[id="${href.replace("#", "")}"]`
            );
            if (binary) {
              const contentType = binary.getAttribute("content-type");
              if (contentType && contentType.startsWith("image")) {
                const imageData = binary.textContent.trim();
                const base64Image = `data:${contentType};base64,${imageData}`;
                const img = document.createElement("img");
                img.src = base64Image;
                img.classList.add("variable-image");
                image.parentElement.replaceChild(img, image);
              }
            }
          });
        }
        const sections = xmlDoc.getElementsByTagName("section");
        const chapters = [];
        if (sections) {
          for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const title = section.getElementsByTagName("title")[0];
            const chapterNumber = i + 1;
            const chapterTitle = title.textContent.trim();
            const chapterContent = section.innerHTML;
            chapters.push({
              number: chapterNumber,
              title: chapterTitle,
              content: chapterContent,
            });
          }
          setBookChapters(chapters);
        }
      })
      .catch((error) => console.error("Error loading fb2 file:", error))
      .finally(() => setLoading(false));
  }, [book]);

  useEffect(() => {
    if (containerRef.current) {
      window.scrollTo(0, 0);
    }
  }, [selectedChapter]);
  useEffect(() => {
    const savedChapter = localStorage.getItem(`selectedChapter_${id}`);
    if (savedChapter !== null) {
      setSelectedChapter(parseInt(savedChapter));
    }
  }, []);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <div>
      <Navbar
        onMenuOpenChange={setIsMenuOpen}
        isBordered
        maxWidth="2xl"
        style={themeStyles}
        position="static"
        className="second-navbar"
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
        </NavbarContent>
        <NavbarContent>
          <NavbarItem>
            <div className="read-book-title-mobile">{title}</div>
          </NavbarItem>
          <NavbarItem>
            <div className="read-book-title-mobile">
              (
              {bookChapters.length > 0 &&
                bookChapters[selectedChapter] &&
                bookChapters[selectedChapter].number}
              ) &nbsp;
              {bookChapters.length > 0 &&
                bookChapters[selectedChapter] &&
                bookChapters[selectedChapter].title}
            </div>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu style={themeStyles}>
          <Button className="defect-button">
            <NavLink to="/" className="navbar-item-defect">
              Return to all Books
              <img
                src="/icon.svg"
                alt="SVG Icon"
                style={{ marginLeft: "8px" }}
              />
            </NavLink>
          </Button>
          <NavbarMenuToggle
            className="burger-button-toggle"
            onClick={onContentModalOpen}
            icon={
              <div className="burger-button-toggle-box">
                <div>Contents</div>
                <img
                  src="/icon2.svg"
                  alt="SVG Icon"
                  style={{ marginLeft: "8px" }}
                />
              </div>
            }
          />
          <Button className="burger-button" onClick={onFontModalOpen}>
            Fonts
            <img
              src="/icon3.svg"
              alt="SVG Icon"
              style={{ marginLeft: "8px" }}
            />
          </Button>
          <Button className="burger-button" onClick={onColorModalOpen}>
            Colors
            <img
              src="/icon4.svg"
              alt="SVG Icon"
              style={{ marginLeft: "8px" }}
            />
          </Button>
          <Button className="defect-button">
            <NavLink
              to={`/readtwocolumns/${id}`}
              className="navbar-item-defect"
            >
              Two Columns Mode
              <img
                src="/icon5.svg"
                alt="SVG Icon"
                style={{ marginLeft: "8px" }}
              />
            </NavLink>
          </Button>
        </NavbarMenu>
      </Navbar>

      <Navbar
        isBordered
        maxWidth="2xl"
        style={themeStyles}
        className="first-navbar"
        position="static"
      >
        <NavbarContent className="iwillwinnavbar">
          <NavbarContent className="iwlillwin-mini-box">
            <NavbarItem>
              <Button className="defect-button">
                <NavLink to="/" className="navbar-item-defect">
                  {/* Return to all Books */}
                  <img
                    src="/icon.svg"
                    alt="SVG Icon"
                    // style={{ marginLeft: "8px" }}
                  />
                </NavLink>
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button className="burger-button" onClick={onContentModalOpen}>
                {/* Contents */}
                <img
                  src="/icon2.svg"
                  alt="SVG Icon"
                  // style={{ marginLeft: "8px" }}
                />
              </Button>
            </NavbarItem>
            <NavbarItem>
              <div className="read-book-title">
                (
                {bookChapters.length > 0 &&
                  bookChapters[selectedChapter] &&
                  bookChapters[selectedChapter].number}
                ) &nbsp;
                {bookChapters.length > 0 &&
                  bookChapters[selectedChapter] &&
                  bookChapters[selectedChapter].title}
              </div>
            </NavbarItem>
          </NavbarContent>
          <Modal
            isOpen={isColorModalOpen}
            onOpenChange={onColorModalOpenChange}
            style={themeStyles}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1 next-mod-header">
                    Change Color Theme
                  </ModalHeader>
                  <ModalBody>
                    <select
                      value={selectedTheme}
                      onChange={handleChangeTheme}
                      style={themeStyles}
                    >
                      <option value="white">White Theme</option>
                      <option value="lgrey">Light Grey Theme</option>
                      <option value="grey">Grey Theme</option>
                      <option value="grey2">Grey 2 Theme</option>
                      <option value="avalanche">Avalanche Theme</option>
                      <option value="blue">Blue Theme</option>
                      <option value="green">Green Theme</option>
                      <option value="pale">Pale Brown Theme</option>
                      <option value="khaki">Khaki Theme</option>
                      <option value="brown">Brown Theme</option>
                      <option value="dgrey">Dark Grey Theme</option>
                      <option value="dark">Dark Grey 2 Theme</option>
                      <option value="black">Black Theme</option>
                      <option value="sith">Sith Theme</option>
                    </select>
                  </ModalBody>
                  <ModalFooter></ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
          <Modal
            isOpen={isFontModalOpen}
            onOpenChange={onFontModalOpenChange}
            style={themeStyles}
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1 next-mod-header">
                Font Settings
              </ModalHeader>
              <ModalBody>
                <select
                  value={selectedFont}
                  onChange={handleChangeFont}
                  style={themeStyles}
                >
                  <option
                    value="main-font-light"
                    style={{ fontFamily: "main-font-light" }}
                  >
                    Comic Helvetic
                  </option>
                  <option
                    value="font-for-read-1"
                    style={{ fontFamily: "font-for-read-1" }}
                  >
                    Gteesti Pro
                  </option>
                  <option
                    value="font-for-read-2"
                    style={{ fontFamily: "font-for-read-2" }}
                  >
                    Attractive
                  </option>
                  <option
                    value="font-for-read-3"
                    style={{ fontFamily: "font-for-read-3" }}
                  >
                    Vremena
                  </option>
                  <option
                    value="font-for-read-4"
                    style={{ fontFamily: "font-for-read-4" }}
                  >
                    Fantasque
                  </option>
                  <option
                    value="font-for-read-5"
                    style={{ fontFamily: "font-for-read-5" }}
                  >
                    Hkgrotesk
                  </option>
                  <option
                    value="font-for-read-6"
                    style={{ fontFamily: "font-for-read-6" }}
                  >
                    Synco Cyrillic
                  </option>
                  <option
                    value="font-for-read-7"
                    style={{ fontFamily: "font-for-read-7" }}
                  >
                    Morning Breeze
                  </option>
                  <option
                    value="font-for-read-8"
                    style={{ fontFamily: "font-for-read-8" }}
                  >
                    MV Crooker
                  </option>
                  <option
                    value="font-for-read-9"
                    style={{ fontFamily: "font-for-read-9" }}
                  >
                    Veles
                  </option>
                  <option
                    value="font-for-read-10"
                    style={{ fontFamily: "font-for-read-10" }}
                  >
                    Jet Brains Mono
                  </option>
                  <option
                    value="font-for-read-11"
                    style={{ fontFamily: "font-for-read-11" }}
                  >
                    Tenada
                  </option>
                  <option
                    value="font-for-read-12"
                    style={{ fontFamily: "font-for-read-12" }}
                  >
                    Kornilow
                  </option>
                  <option
                    value="font-for-read-13"
                    style={{ fontFamily: "font-for-read-13" }}
                  >
                    Avenir Next
                  </option>
                  <option
                    value="font-for-read-14"
                    style={{ fontFamily: "font-for-read-14" }}
                  >
                    Arvo
                  </option>
                  <option
                    value="font-for-read-15"
                    style={{ fontFamily: "font-for-read-15" }}
                  >
                    Rainsuit
                  </option>
                  <option
                    value="font-for-read-16"
                    style={{ fontFamily: "font-for-read-16" }}
                  >
                    ALS Sirius
                  </option>
                  <option value="Arial" style={{ fontFamily: "Arial" }}>
                    Arial
                  </option>
                  <option value="Roboto" style={{ fontFamily: "Roboto" }}>
                    Roboto
                  </option>
                </select>
              </ModalBody>
              <div className="input-settings-box">
                <span>Font Size: {fontSize}px</span>
                <Slider
                  color="secondary"
                  size="sm"
                  step={1}
                  minValue={10}
                  maxValue={30}
                  defaultValue={18}
                  value={fontSize}
                  onChange={(value) => handleChangeFontSize(value)}
                  className="max-w-md"
                />
              </div>
              <div
                className="input-settings-box"
                style={{ marginBottom: "30px" }}
              >
                <span>Container Size: {containerSize}px</span>
                <Slider
                  color="secondary"
                  size="sm"
                  step={50}
                  minValue={100}
                  maxValue={1500}
                  defaultValue={800}
                  value={containerSize}
                  onChange={(value) => handleChangeContainerSize(value)}
                  className="max-w-md"
                />
              </div>
            </ModalContent>
          </Modal>
          <Modal
            isOpen={isContentModalOpen}
            onOpenChange={onContentModalOpenChange}
            scrollBehavior="inside"
            style={themeStyles}
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1 next-mod-header">
                Table of Contents
              </ModalHeader>
              <ModalBody>
                <ul>
                  {bookChapters.map((chapter, index) => (
                    <li key={index}>
                      <Button
                        onClick={() => {
                          setSelectedChapter(index);
                          handleChangeChapter(index);
                        }}
                        className={`table-content-item ${
                          selectedChapter === index ? "current-chapter" : ""
                        }`}
                      >
                        ({chapter.number}) {chapter.title}
                      </Button>
                    </li>
                  ))}
                </ul>
              </ModalBody>
              <ModalFooter></ModalFooter>
            </ModalContent>
          </Modal>
          <NavbarContent>
            <p className="read-book-title">{title}</p>
          </NavbarContent>
          <NavbarContent className="iwlillwin-mini-box">
            <NavbarItem>
              <Button className="burger-button" onClick={onFontModalOpen}>
                {/* Fonts */}
                <img
                  src="/icon3.svg"
                  alt="SVG Icon"
                  // style={{ marginLeft: "8px" }}
                />
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button className="burger-button" onClick={onColorModalOpen}>
                {/* Colors */}
                <img
                  src="/icon4.svg"
                  alt="SVG Icon"
                  // style={{ marginLeft: "8px" }}
                />
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button className="defect-button">
                <NavLink
                  to={`/readtwocolumns/${id}`}
                  className="navbar-item-defect"
                >
                  {/* Two Columns Mode */}
                  <img
                    src="/icon5.svg"
                    alt="SVG Icon"
                    // style={{ marginLeft: "8px" }}
                  />
                </NavLink>
              </Button>
            </NavbarItem>
          </NavbarContent>
        </NavbarContent>
      </Navbar>
      <div
        className="main-read"
        ref={containerRef}
        style={{
          ...themeStyles,
          fontFamily: selectedFont,
        }}
      >
        <div
          className="container"
          style={{
            fontSize: `${fontSize}px`,
            width: `${containerSize}px`,
          }}
        >
          <div>
            {loading ? (
              <div>
                <span className="loader"></span>
              </div>
            ) : (
              <>
                {bookChapters[selectedChapter] ? (
                  <div>
                    <p className="chapter">
                      {bookChapters[selectedChapter].title}
                    </p>
                    <p>
                      {bookChapters[selectedChapter].titleParagraph ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              bookChapters[selectedChapter].titleParagraph,
                          }}
                        />
                      ) : null}
                    </p>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: bookChapters[selectedChapter].content,
                      }}
                    />
                  </div>
                ) : (
                  <p>No chapters available</p>
                )}
              </>
            )}
          </div>

          <div className="button-container">
            {hasPreviousChapter ? (
              <Button
                onClick={() => handleChangeChapter(selectedChapter - 1)}
                className="burger-button"
              >
                <img
                  src="/icon6.svg"
                  alt="SVG Icon"
                  // style={{ marginLRight: "4px" }}
                />
                {/* Previous Chapter */}
              </Button>
            ) : (
              <div></div>
            )}
            {hasNextChapter ? (
              <Button
                onClick={() => handleChangeChapter(selectedChapter + 1)}
                className="burger-button"
              >
                {/* Next Chapter */}
                <img
                  src="/icon7.svg"
                  alt="SVG Icon"
                  // style={{ marginLeft: "4px" }}
                />
              </Button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Read;
