import React from "react";

const SurveyTemplate = () => {
  const categories = [
    "Doorstep pickup/dropoff",
    "Outbound/inbound transfers",
    "Departure/arrival lounges",
    "Flights",
    "Resort food/beverage options",
    "Resort facilities",
    "Room",
    "Excursions",
    "Evening entertainment",
  ];

  const headers = [
    "Very satisfied",
    "Moderately satisfied",
    "Neither satisfied nor dissatisfied",
    "Moderately dissatisfied",
    "Very dissatisfied",
  ];

  const getColor = (index) => {
    switch (index) {
      case 0:
        return "text-brown-500";
      case 1:
        return "text-green-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-yellow-500";
      case 4:
        return "text-red-500";
      default:
        return "";
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="bg-teal-600 text-white px-4 py-2 text-left rounded-tl-lg">
              &nbsp;
            </th>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 text-sm font-medium text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              <td className="bg-teal-600 text-white px-4 py-2 text-left">
                {category}
              </td>
              {headers.map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-2 text-center">
                  <span
                    className={`inline-block w-5 h-5 border-2 rounded-full ${getColor(
                      colIndex
                    )} border-current`}
                  ></span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SurveyTemplate;
