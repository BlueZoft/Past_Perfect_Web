import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const validateTitle = (title) => {
  const regex = /^[A-Za-z0-9\s.']{3,20}$/;
  return regex.test(title);
};

const validateDescription = (description) => {
  const regex = /^[A-Za-z0-9\s!.']{10,200}$/;
  return regex.test(description);
};

const validatePrice = (price) => {
  const numPrice = Number(price);
  return Number.isInteger(numPrice) && numPrice >= 1 && numPrice <= 50000;
};

const Publish = ({ token }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Add error states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [priceError, setPriceError] = useState('');

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const conditionOptions = ["New with Tags", "Like New", "Fairly Used", "Used", "Worn"];

  const handlePictureChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + pictures.length > 3) {
      setErrorMessage("Maximum 3 images allowed");
      return;
    }
    setPictures(prevPictures => [...prevPictures, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const removePicture = (index) => {
    const newPictures = pictures.filter((_, i) => i !== index);
    setPictures(newPictures);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleTitleChange = (event) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    if (!validateTitle(newTitle)) {
      setTitleError('Title must be 3-20 characters long, letters and numbers only');
    } else {
      setTitleError('');
    }
  };

  const handleDescriptionChange = (event) => {
    const newDescription = event.target.value;
    setDescription(newDescription);
    if (!validateDescription(newDescription)) {
      setDescriptionError('Description must be 10-200 characters long');
    } else {
      setDescriptionError('');
    }
  };

  const handlePriceChange = (event) => {
    const newPrice = event.target.value;
    setPrice(newPrice);
    if (!validatePrice(newPrice)) {
      setPriceError('Price must be a whole number');
    } else {
      setPriceError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !description || !price || !size || !condition || pictures.length === 0) {
      setErrorMessage("All fields are required!");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      pictures.forEach((picture, index) => {
        formData.append(`picture${index + 1}`, picture);
      });
      formData.append("title", title);
      formData.append("description", description);
      formData.append("size", size);
      formData.append("condition", condition);
      formData.append("price", price);

      const response = await axios.post(
        `${API_URL}/offer/publish`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data._id) {
        navigate(`/offer/${response.data._id}`);
      } else {
        setErrorMessage("Publish failed");
      }
    } catch (error) {
      console.log(error.message);
      setErrorMessage("An error occurred during publishing");
    } finally {
      setIsLoading(false);
    }
  };

  return token ? (
    <form
      style={{ padding: 0 }}
      onSubmit={handleSubmit}
      className="signup-form publish-form container"
    >
      <div className="file-select">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            width: '100%',
            marginBottom: '20px'
          }}
        >
          {previews.map((preview, index) => (
            <div
              key={index}
              style={{
                flex: '1',
                maxWidth: 'calc(33.33% - 10px)',
                position: 'relative',
                border: '1px dashed #ccc',
                borderRadius: '4px'
              }}
            >
              <img
                src={preview}
                alt=""
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              <div
                className="remove-img-button"
                onClick={() => removePicture(index)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '50%',
                  padding: '5px'
                }}
              >
                ✕
              </div>
            </div>
          ))}
        </div>
        {pictures.length < 3 && (
          <div className="dashed-preview-without">
            <div className="input-upload">
              <label htmlFor="file" className="input-label">
                <span className="input-sign">+</span>{" "}
                <span>Add a photo</span>
              </label>
            </div>
            <input
              style={{ display: "none" }}
              id="file"
              type="file"
              multiple
              onChange={handlePictureChange}
            />
          </div>
        )}
      </div>
      <br />
      <div className="text-input-section">
        <div className="text-input">
          <h4>Title</h4>
          <input
            type="text"
            placeholder="title"
            value={title}
            onChange={handleTitleChange}
          />
          {titleError && <div className="error-message">{titleError}</div>}
        </div>
        <div className="text-input">
          <h4>Description</h4>
          <textarea
            placeholder="description"
            value={description}
            onChange={handleDescriptionChange}
          />
          {descriptionError && <div className="error-message">{descriptionError}</div>}
        </div>
        <div className="text-input">
          <h4>Size</h4>
          <select value={size} onChange={(event) => setSize(event.target.value)}>
            <option value="">Select Size</option>
            {sizeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="text-input">
          <h4>Condition</h4>
          <select value={condition} onChange={(event) => setCondition(event.target.value)}>
            <option value="">Select Condition</option>
            {conditionOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="text-input">
          <h4>Price</h4>
          <input
            type="number"
            placeholder="price"
            value={price}
            onChange={handlePriceChange}
          />
          {priceError && <div className="error-message">{priceError}</div>}
        </div>
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Publishing..." : "Publish"}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
    </form>
  ) : (
    <Navigate to="/login" />
  );
};

export default Publish;