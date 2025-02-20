import { useState, useRef, useEffect } from "react";
import { FaRegFileImage } from "react-icons/fa"; // Fixed typo
import { MdDeleteOutline } from "react-icons/md";

const ImageSelector = ({ image, setImage, handleDeleteImg }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  useEffect(() => {
    //ifthe image prop is a string (url), set it as the previewUrl
    if (typeof image === "string") {
      setPreviewUrl(image);
    } else if (image) {
      //if the image prop is a file, set the previewUrl to the URL.createObjectURL of the file
      setPreviewUrl(URL.createObjectURL(image));
    } else {
      //if there is no image, clear the previewUrl
      setPreviewUrl(null);
    }
    return () => {
      if (previewUrl && typeof previewUrl === "string" && !image) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [image]);
  return (
    <div className="flex flex-col items-center gap-2">
      {previewUrl ? (
        <div className=" w-full relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-[300px] rounded-lg object-cover"
          />
          <button
            className="btn-small btn-delete absolute top-2 right-2 p-1"
            onClick={() => {
              setImage(null);
              setPreviewUrl(null);
            }}
          >
            <MdDeleteOutline size={18} />
          </button>
        </div>
      ) : (
        <button
          className="w-full h-[220px] flex flex-col items-center justify-center gap-2 border border-dashed bg-slate-50 border-cyan-200/50 rounded-lg"
          onClick={() => onChooseFile()}
        >
          <div className="w-14 h-14 flex items-center justify-center bg-cyan-50 rounded-full border border-cyan-100">
            <FaRegFileImage className="text-xl text-cyan-500" />
          </div>
          <p className="text-sm text-slate-500">Browse image files to upload</p>
        </button>
      )}

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageSelector;
