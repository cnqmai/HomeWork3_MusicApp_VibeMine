-- Xóa dữ liệu cũ để tránh trùng lặp
TRUNCATE TABLE app_user, artist, album, track, playlist, playlist_tracks, user_favorites, track_artists RESTART IDENTITY CASCADE;

-- Dữ liệu mẫu cho bảng app_user
INSERT INTO app_user (id, username, email, password, role) VALUES
(1, 'maicnq', 'cnqmai@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfeclM3eW5bL7GS6uVME/incQOMZgpEcL2', 'USER');

-- Dữ liệu mẫu cho bảng artist (Không còn nghệ sĩ kết hợp)
INSERT INTO artist (id, name, bio, avatar_url) VALUES
(1, 'Vũ', 'Thái Vũ, được biết đến với nghệ danh Vũ, là một ca sĩ-nhạc sĩ người Việt Nam.', 'https://sidoni.net/uploads/file/2020/thang7/24/tieu-su-hoang-thai-vu-tung-tot-nghiep-hoc-vien-khoa-hoc-quan-su-1.jpg'),
(2, 'AMEE', 'Trần Huyền My, thường được biết đến với nghệ danh AMEE, là một nữ ca sĩ và diễn viên người Việt Nam.', 'https://vov2.vov.vn/sites/default/files/styles/large/public/2022-02/amee_tmcgya-11.jpg'),
(3, 'Low G', 'Nguyễn Hoàng Long, rapname Low G, là một rapper tài năng của giới Underground.', 'https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-6/515922314_10093231147381035_4988806847360037151_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFSQRyUUJz8kBtKA8RlteMHTe4R6ELNRL1N7hHoQs1EvSWhVu5wfjMj9MjV8mOxlhImv8Gjd3sEuj8BijbozcTQ&_nc_ohc=mM62dPJCd60Q7kNvwFHMhyI&_nc_oc=Adk_udcoHQ70oPS6-uj18TXYL0CgiopxG9okEYJWkJvgVgKqQKW4l8nDq4kbCkZeCRc&_nc_zt=23&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=aGaAjZtdaYG9j3OJgp4q-Q&oh=00_AfcQeRqzlKgccO2N6nZTc2b2WkNLhvGlRLqCv6NgiN2Pcw&oe=68F3E654'),
(4, 'Anh Trai Say Hi', 'Các nghệ sĩ từ chương trình Anh Trai Say Hi.', 'https://upload.wikimedia.org/wikipedia/vi/thumb/7/7e/AnhTraiSayHiOpening.jpg/500px-AnhTraiSayHiOpening.jpg'),
(5, 'tlinh', 'Nguyễn Thảo Linh, nghệ danh tlinh, là một nữ rapper và ca sĩ đa tài của làng nhạc Việt.', 'https://vcdn1-giaitri.vnecdn.net/2024/06/14/Tlinh-1-jpeg-9338-1718340500.jpg?w=460&h=0&q=100&dpr=2&fit=crop&s=Vu-qyWxFvoZWJjKyaCmogQ');

-- Dữ liệu mẫu cho bảng album
INSERT INTO album (id, title, cover_art_url, release_year, artist_id) VALUES
(1, 'Một Vạn Năm', 'https://i.scdn.co/image/ab67616d0000b273824ac9ea17bde4ea1fd09f4f', 2022, 1),
(2, 'dreAMEE', 'https://upload.wikimedia.org/wikipedia/vi/f/f2/Amee_-_Dreamee.png', 2020, 2),
(3, 'Anh Trai Say Hi Hits', 'https://i.scdn.co/image/ab67616d0000b273942ff980aeb5ffcb0e5040da', 2024, 4),
(4, 'Bảo Tàng Của Nuối Tiếc', 'https://i.ytimg.com/vi/CLQKb_PDzLw/maxresdefault.jpg', 2024, 1);

-- Dữ liệu mẫu cho bảng track (Không còn cột artist_id)
INSERT INTO track (id, title, album_id, genre, cover_art_url, track_url, lyrics, duration, is_trending, play_count, favorite_count) VALUES
(1, 'Lạ Lùng', 1, 'Indie', 'https://lyricvn.com/wp-content/uploads/2019/10/a8f70ecae845eadbe4495aa99308f3f0_1484296225.png', 'placeholder/la-lung.mp3', '...', 210, true, 2500, 300),
(2, 'Bước Qua Mùa Cô Đơn', 1, 'Indie', 'https://img.vietcetera.com/uploads/images/20-dec-2020/vuuu-rvv-1608429786711.jpg', 'placeholder/buoc-qua-mua-co-don.mp3', '...', 245, true, 1800, 250),
(3, 'Nếu Những Tiếc Nuối', 4, 'Indie', 'https://i.ytimg.com/vi/9_JV3fyPv64/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGUgWChOMA8=&rs=AOn4CLDdlL4x7S97z9lJYzbEzCpBYskqQQ', 'placeholder/neu-nhung-tiec-nuoi.mp3', '...', 230, false, 1100, 140),
(4, 'Mùa Mưa Ấy', null, 'Indie', 'https://i.ytimg.com/vi/8DS7HfwdjGs/maxresdefault.jpg', 'placeholder/mua-mua-ay.mp3', '...', 255, false, 900, 110),
(5, 'Những Lời Hứa Bỏ Quên', 4, 'Indie', 'https://i.ytimg.com/vi/XmC2wvVsVDk/mqdefault.jpg', 'placeholder/nhung-loi-hua-bo-quen.mp3', '...', 260, true, 3200, 450),

(6, 'Anh Nhà Ở Đâu Thế?', 2, 'V-Pop', 'https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/5/2/7/8/527879fe969864e5e149db25432debb0.jpg', 'placeholder/anh-nha-o-dau-the.mp3', '...', 220, true, 3000, 400),
(7, 'Trời Giấu Trời Mang Đi', 2, 'V-Pop', 'https://images.genius.com/4e230fc11e3869feb632dd87a248ccb8.640x640x1.jpg', 'placeholder/troi-giau-troi-mang-di.mp3', '...', 205, false, 1200, 150),
(8, 'Sao Anh Chưa Về Nhà', 2, 'V-Pop', 'https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/6/6/f/4/66f40f8639e0e23f95e444f3d9368c9c.jpg', 'placeholder/sao-anh-chua-ve-nha.mp3', '...', 262, true, 2900, 380),
(9, 'An Thần', null, 'Rap', 'https://i.scdn.co/image/ab67616d0000b273c8d355355c2c62b74b0809e4', 'placeholder/an-than.mp3', '...', 180, true, 2200, 280),
(10, 'Hào Quang', 3, 'V-Pop', 'https://bloganchoi.com/wp-content/uploads/2024/07/hao-quang-lyrics-anh-trai-say-hi-2.jpg', 'placeholder/dont-care.mp3', '...', 215, true, 5000, 800),
(11, 'Nếu Lúc Đó', null, 'R&B', 'https://i1.sndcdn.com/artworks-4kULcEKQJRho0WUK-wFZwag-t500x500.jpg', 'placeholder/neu-luc-do.mp3', '...', 225, true, 4200, 550),
(12, 'Love Game', null, 'Rap', 'https://photo-resize-zmp3.zmdcdn.me/w256_r1x1_jpeg/cover/c/7/9/8/c79845b00d5f01f63cbca10d7a3aba07.jpg', 'placeholder/love-game.mp3', '...', 200, true, 3500, 450);

-- Bảng trung gian track_artists để thể hiện quan hệ nhiều-nhiều
INSERT INTO track_artists (track_id, artist_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1), -- Nhạc của Vũ
(6, 2), (7, 2), (8, 2),                 -- Nhạc của AMEE
(9, 3),                                 -- Nhạc của Low G
(10, 4),                                -- Nhạc của Anh Trai Say Hi
(11, 5),                                -- Nhạc của tlinh
(12, 3), (12, 5);                       -- Love Game của Low G và tlinh

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
INSERT INTO user_favorites (user_id, track_id) VALUES
(1, 1),
(1, 5),
(1, 12);