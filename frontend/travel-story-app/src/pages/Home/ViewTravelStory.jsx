import moment from "moment";
import { GrMapLocation } from "react-icons/gr";
import { IoClose } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import noImage from "../../assets/images/no-img.png";

const ViewTravelStory = ({
  storyInfo,
  onClose,
  onEditClick,
  onDeleteClick,
}) => {
  if (!storyInfo) return null; // Prevents errors if storyInfo is missing

  return (
    <div>
      <div className="relative">
        {/* Action Buttons */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
            <button className="btn-small" onClick={onEditClick}>
              <TbEdit style={{ fontSize: "18px" }} />
              UPDATE STORY
            </button>
            <button className="btn-small btn-delete" onClick={onDeleteClick}>
              <MdDeleteOutline style={{ fontSize: "16px" }} />
              DELETE
            </button>
            <button className="btn-small" onClick={onClose}>
              <IoClose style={{ fontSize: "18px" }} />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="flex-1 flex flex-col gap-2 py-4">
          <h1 className="text-2xl text-slate-950">{storyInfo.title}</h1>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {moment(storyInfo.visitedDate).format("Do MMM YYYY")}
            </span>

            {/* Location Info */}
            <div className="flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded px-2 py-1">
              <GrMapLocation className="text-sm" />
              <span>
                {Array.isArray(storyInfo.visitedLocation)
                  ? storyInfo.visitedLocation.join(", ")
                  : "Unknown Location"}
              </span>
            </div>
          </div>
          <img
            src={storyInfo?.imageUrl || noImage}
            alt={storyInfo?.title || "No Image Available"}
            className="w-full h-[300px] mt-2 object-cover rounded-lg"
          />

          <div className="mt-4">
            <p className="text-sm-text-slate-950 leading-6 text-justify whitespace-pre-line">
              {storyInfo.story}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTravelStory;
