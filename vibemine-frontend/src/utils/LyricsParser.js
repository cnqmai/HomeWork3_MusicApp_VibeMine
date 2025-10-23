// src/utils/LyricsParser.js

// Định dạng LRC cơ bản: [mm:ss.xx] line content
// Hỗ trợ mm, ss, xx có thể nhiều hơn 2 chữ số và xx có thể 1-3 chữ số
const timeRegex = /\[(\d{2,}):(\d{2,})\.?(\d{1,3})?\]/;

/**
 * Parses an LRC format string into an array of timed lyric lines.
 * @param {string | null | undefined} lrcString The LRC formatted string.
 * @returns {Array<{time: number, text: string}>} Array of lyric objects sorted by time.
 */
export const parseLRC = (lrcString) => {
  // Trả về mảng rỗng nếu input không hợp lệ
  if (!lrcString || typeof lrcString !== 'string') {
    return [];
  }

  const lines = lrcString.split('\n');
  const lyrics = [];

  lines.forEach(line => {
    // Xử lý nhiều timestamp trên cùng một dòng (ví dụ: [00:10.50][01:15.00] Lời...)
    let currentLine = line;
    let textContent = '';
    const timestamps = [];

    // Tách phần text ra trước
    const lastTimestampEnd = currentLine.lastIndexOf(']');
    if (lastTimestampEnd !== -1) {
        textContent = currentLine.substring(lastTimestampEnd + 1).trim();
        currentLine = currentLine.substring(0, lastTimestampEnd + 1);
    } else {
        // Nếu không có timestamp nào, nhưng có nội dung -> bỏ qua? Hoặc coi là dòng thường?
        // Hiện tại, bỏ qua dòng không có timestamp hợp lệ mà không có nội dung text
        textContent = currentLine.trim(); // Vẫn lấy text phòng trường hợp không có tag time
        if (!textContent) return; // Bỏ qua dòng trống hoàn toàn
    }


    // Tìm tất cả các timestamp trên dòng
    let match;
    while ((match = currentLine.match(timeRegex)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      let milliseconds = parseInt(match[3] || '0', 10);

      if (match[3] && match[3].length === 1) milliseconds *= 100;
      else if (match[3] && match[3].length === 2) milliseconds *= 10;

       // Kiểm tra giá trị NaN sau khi parse
       if (isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) {
          console.warn("Invalid time format found in LRC:", line);
          continue; // Bỏ qua timestamp không hợp lệ này
       }

      const time = (minutes * 60 + seconds) * 1000 + milliseconds;
      timestamps.push(time);

      // Loại bỏ timestamp đã xử lý khỏi dòng để tìm timestamp tiếp theo
      currentLine = currentLine.replace(match[0], '');
    }

    // Nếu không tìm thấy timestamp nào nhưng có text, có thể là metadata hoặc lời không định thời gian
    if (timestamps.length === 0 && textContent) {
         // Có thể thêm vào mảng lyrics với time = -1 hoặc bỏ qua
         // lyrics.push({ time: -1, text: textContent }); // Ví dụ
         console.log("Line without timestamp:", textContent);
         return; // Hiện tại bỏ qua
    }

    // Thêm các dòng lyric với timestamp tương ứng
    timestamps.forEach(time => {
      // Chỉ thêm nếu có nội dung text
      if (textContent) {
        lyrics.push({ time, text: textContent });
      }
    });
  });

  // Sắp xếp lại lần cuối để đảm bảo thứ tự thời gian chính xác
  return lyrics.sort((a, b) => a.time - b.time);
};