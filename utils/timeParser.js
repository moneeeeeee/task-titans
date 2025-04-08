function parseDurationString(durationStr) {
    const parts = durationStr.split(":").map(Number);
    if (parts.length !== 4) {
      throw new Error("Invalid duration format. Use hh:mm:ss:ms");
    }
  
    const [hours, minutes, seconds, milliseconds] = parts;
  
    if (
      isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)
    ) {
      throw new Error("Invalid time values in duration string");
    }
  
    const totalMilliseconds =
      (hours * 3600000) +
      (minutes * 60000) +
      (seconds * 1000) +
      milliseconds;
  
    return totalMilliseconds;
  }
  
module.exports = parseDurationString;
  