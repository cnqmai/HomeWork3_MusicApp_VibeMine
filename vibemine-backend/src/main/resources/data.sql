-- Dữ liệu mẫu cho bảng app_user
INSERT INTO app_user (id, username, email, password, role) VALUES
(1, 'cnqmai', 'cnqmai@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfeclM3eW5bL7GS6uVME/incQOMZgpEcL2', 'USER');

-- Dữ liệu mẫu cho bảng artist
INSERT INTO artist (id, name, bio, avatar_url) VALUES
(1, 'Vũ', 'Thái Vũ, được biết đến với nghệ danh Vũ, là một ca sĩ-nhạc sĩ người Việt Nam.', 'https://sidoni.net/uploads/file/2020/thang7/24/tieu-su-hoang-thai-vu-tung-tot-nghiep-hoc-vien-khoa-hoc-quan-su-1.jpg'),
(2, 'AMEE', 'Trần Huyền My, thường được biết đến với nghệ danh AMEE, là một nữ ca sĩ và diễn viên người Việt Nam.', 'https://vov2.vov.vn/sites/default/files/styles/large/public/2022-02/amee_tmcgya-11.jpg'),
(3, 'Low G', 'Nguyễn Hoàng Long, rapname Low G, là một rapper tài năng của giới Underground.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNXVCiQmayyJQzh49SVH_6sODZttEtgcvlUw&s'),
(4, 'Anh Trai Say Hi', 'Các nghệ sĩ từ chương trình Anh Trai Say Hi.', 'https://upload.wikimedia.org/wikipedia/vi/thumb/7/7e/AnhTraiSayHiOpening.jpg/500px-AnhTraiSayHiOpening.jpg'),
(5, 'tlinh', 'Nguyễn Thảo Linh, nghệ danh tlinh, là một nữ rapper và ca sĩ đa tài của làng nhạc Việt.', 'https://vcdn1-giaitri.vnecdn.net/2024/06/14/Tlinh-1-jpeg-9338-1718340500.jpg?w=460&h=0&q=100&dpr=2&fit=crop&s=Vu-qyWxFvoZWJjKyaCmogQ');

-- Dữ liệu mẫu cho bảng album
INSERT INTO album (id, title, cover_art_url, release_year, artist_id) VALUES
(1, 'Một Vạn Năm', 'https://i.scdn.co/image/ab67616d0000b273824ac9ea17bde4ea1fd09f4f', 2022, 1),
(2, 'dreAMEE', 'https://upload.wikimedia.org/wikipedia/vi/f/f2/Amee_-_Dreamee.png', 2020, 2),
(3, 'Anh Trai Say Hi Hits', 'https://i.scdn.co/image/ab67616d0000b273942ff980aeb5ffcb0e5040da', 2024, 4),
(4, 'Bảo Tàng Của Nuối Tiếc', 'https://i.ytimg.com/vi/CLQKb_PDzLw/maxresdefault.jpg', 2024, 1);

-- Dữ liệu mẫu cho bảng track (ĐÃ CẬP NHẬT DURATION thành milliseconds)
-- LƯU Ý: track_url cần được thay thế bằng URL thực tế. Lyrics chưa có timestamp cần cập nhật sang định dạng LRC.
INSERT INTO track (id, title, album_id, genre, cover_art_url, track_url, lyrics, duration, is_trending, play_count, favorite_count) VALUES
(1, 'Lạ Lùng', 1, 'Indie', 'https://lyricvn.com/wp-content/uploads/2019/10/a8f70ecae845eadbe4495aa99308f3f0_1484296225.png', 'https://www.nhaccuatui.com/bai-hat/la-lung-vu.X1UKym80b3F8.html', E'[00:15.50] Kìa màn đêm hiu hắt\n[00:19.00] Mang tên em quay về trong giấc mơ\n[00:23.00] Sao đôi tay vẫn cứ run run dù đã cố ngăn\n[00:29.80] Kìa nụ hôn bối rối\n[00:33.50] Trao cho ai kia rồi chẳng nói nên lời\n[00:37.80] Sao con tim vẫn cứ đau đau dù đã nói quên\n[00:44.20] Lạ lùng em nhớ anh\n[00:47.50] Lạ lùng sao em vẫn cứ nhớ anh\n[00:51.50] Dù giờ đây em đã có ai bên cạnh\n[00:58.80] Lạ lùng em khóc đấy\n[01:02.00] Lạ lùng sao nước mắt cứ tuôn rơi\n[01:06.50] Chẳng còn yêu sao em vẫn đau thế này?\n[01:13.00] (Music)\n[01:42.50] Kìa giọng nói ấm áp\n[01:46.00] Ru em trong cơn mơ mỗi tối\n[01:50.00] Sao đôi mi vẫn cứ cay cay dù đã cố ngăn\n[01:57.00] Kìa bờ vai vững chắc\n[02:00.50] Em trao ai kia rồi chẳng nghĩ suy gì\n[02:05.00] Sao con tim vẫn cứ đau đau dù đã nói quên\n[02:11.80] Lạ lùng em nhớ anh\n[02:14.80] Lạ lùng sao em vẫn cứ nhớ anh\n[02:19.00] Dù giờ đây em đã có ai bên cạnh\n[02:26.00] Lạ lùng em khóc đấy\n[02:29.50] Lạ lùng sao nước mắt cứ tuôn rơi\n[02:34.00] Chẳng còn yêu sao em vẫn đau thế này?\n[02:40.50] Lạ lùng em nhớ anh\n[02:44.00] Lạ lùng sao em vẫn cứ nhớ anh\n[02:48.00] Dù giờ đây em đã có ai bên cạnh\n[02:55.00] Lạ lùng em khóc đấy\n[02:58.50] Lạ lùng sao nước mắt cứ tuôn rơi\n[03:03.00] Chẳng còn yêu sao em vẫn đau thế này?', 210000, true, 2500, 300), -- 210 giây -> 210000 ms
(2, 'Bước Qua Mùa Cô Đơn', 1, 'Indie', 'https://img.vietcetera.com/uploads/images/20-dec-2020/vuuu-rvv-1608429786711.jpg', 'https://www.nhaccuatui.com/bai-hat/buoc-qua-mua-co-don-vu.t0iJ9C1HGyv1.html', E'[00:00.00] (Lời bài hát Bước Qua Mùa Cô Đơn chưa có timestamp)', 245000, true, 1800, 250), -- 245 giây -> 245000 ms
(3, 'Nếu Những Tiếc Nuối', 4, 'Indie', 'https://i.ytimg.com/vi/9_JV3fyPv64/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGUgWChOMA8=&rs=AOn4CLDdlL4x7S97z9lJYzbEzCpBYskqQQ', 'https://www.nhaccuatui.com/bai-hat/neu-nhung-tiec-nuoi-vu.o54D60Qk26s9.html', E'[00:00.00] (Lời bài hát Nếu Những Tiếc Nuối chưa có timestamp)', 230000, false, 1100, 140), -- 230 giây -> 230000 ms
(4, 'Mùa Mưa Ấy', null, 'Indie', 'https://i.ytimg.com/vi/8DS7HfwdjGs/maxresdefault.jpg', 'https://zingmp3.vn/bai-hat/Mua-Mua-Ay-Vu/Z7BF70E8.html', E'[00:00.00] (Lời bài hát Mùa Mưa Ấy chưa có timestamp)', 255000, false, 900, 110), -- 255 giây -> 255000 ms
(5, 'Những Lời Hứa Bỏ Quên', 4, 'Indie', 'https://i.ytimg.com/vi/XmC2wvVsVDk/mqdefault.jpg', 'https://www.nhaccuatui.com/song/cJ6lXsQLONjC?source=app', E'[00:00.00] (Lời bài hát Những Lời Hứa Bỏ Quên chưa có timestamp)', 260000, true, 3200, 450), -- 260 giây -> 260000 ms
(6, 'Anh Nhà Ở Đâu Thế?', 2, 'V-Pop', 'https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/5/2/7/8/527879fe969864e5e149db25432debb0.jpg', 'https://www.nhaccuatui.com/bai-hat/anh-nha-o-dau-the-amee-feat-b-ray.K4YLxAe0y77Q.html', E'[00:00.00] (Lời bài hát Anh Nhà Ở Đâu Thế chưa có timestamp)', 220000, true, 3000, 400), -- 220 giây -> 220000 ms
(7, 'Trời Giấu Trời Mang Đi', 2, 'V-Pop', 'https://images.genius.com/4e230fc11e3869feb632dd87a248ccb8.640x640x1.jpg', 'https://www.nhaccuatui.com/bai-hat/troi-giau-troi-mang-di-amee-feat-viruss.j4g6d5f49VvV.html', E'[00:00.00] (Lời bài hát Trời Giấu Trời Mang Đi chưa có timestamp)', 205000, false, 1200, 150), -- 205 giây -> 205000 ms
(8, 'Sao Anh Chưa Về Nhà', 2, 'V-Pop', 'https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/6/6/f/4/66f40f8639e0e23f95e444f3d9368c9c.jpg', 'https://www.nhaccuatui.com/bai-hat/sao-anh-chua-ve-nha-amee-feat-ricky-star.v7L1gKM8L1S5.html', E'[00:00.00] (Lời bài hát Sao Anh Chưa Về Nhà chưa có timestamp)', 262000, true, 2900, 380), -- 262 giây -> 262000 ms
(9, 'An Thần', null, 'Rap', 'https://i.scdn.co/image/ab67616d0000b273c8d355355c2c62b74b0809e4', 'https://www.nhaccuatui.com/bai-hat/an-than-low-g-feat-thang.R4V4e1S27K6E.html', E'[00:00.00] (Lời bài hát An Thần chưa có timestamp)', 180000, true, 2200, 280), -- 180 giây -> 180000 ms
(10, 'Hào Quang', 3, 'V-Pop', 'https://bloganchoi.com/wp-content/uploads/2024/07/hao-quang-lyrics-anh-trai-say-hi-2.jpg', 'https://www.nhaccuatui.com/bai-hat/hao-quang-remix-anh-trai-say-hi.S1R1z1j7z1o1.html', E'[00:00.00] (Lời bài hát Hào Quang chưa có timestamp)', 215000, true, 5000, 800), -- 215 giây -> 215000 ms
(11, 'Nếu Lúc Đó', null, 'R&B', 'https://i1.sndcdn.com/artworks-4kULcEKQJRho0WUK-wFZwag-t500x500.jpg', 'https://www.nhaccuatui.com/bai-hat/neu-luc-do-tlinh.8z0Z0q1Q1J1V.html', E'[00:00.00] (Lời bài hát Nếu Lúc Đó chưa có timestamp)', 225000, true, 4200, 550), -- 225 giây -> 225000 ms
(12, 'Love Game', null, 'Rap', 'https://photo-resize-zmp3.zmdcdn.me/w256_r1x1_jpeg/cover/c/7/9/8/c79845b00d5f01f63cbca10d7a3aba07.jpg', 'https://www.nhaccuatui.com/bai-hat/love-game-low-g-feat-tlinh.y1t1g1Y1B1q1.html', E'[00:00.00] (Lời bài hát Love Game chưa có timestamp)', 200000, true, 3500, 450); -- 200 giây -> 200000 ms

-- Bảng trung gian track_artists (many-to-many)
INSERT INTO track_artists (track_id, artist_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 2), (7, 2), (8, 2),
(9, 3),
(10, 4),
(11, 5),
(12, 3), (12, 5);

-- Dữ liệu mẫu cho bảng playlist
INSERT INTO playlist (id, name, user_id, created_at) VALUES
(1, 'V-Pop Yêu Thích', 1, NOW()),
(2, 'Rap Việt Cực Chất', 1, NOW()),
(3, 'Tâm Trạng Cùng Vũ', 1, NOW());

-- Dữ liệu mẫu cho bảng playlist_tracks
INSERT INTO playlist_tracks (playlist_id, track_id) VALUES
(1, 6), (1, 7), (1, 8), (1, 10), (1, 11),
(2, 9), (2, 12),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5);

-- Dữ liệu mẫu cho bảng user_favorites
INSERT INTO user_favorites (user_id, track_id, added_at) VALUES (1, 1, NOW());
INSERT INTO user_favorites (user_id, track_id, added_at) VALUES (1, 5, NOW());
INSERT INTO user_favorites (user_id, track_id, added_at) VALUES (1, 12, NOW());