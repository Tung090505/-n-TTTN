CHƯƠNG 1. GIỚI THIỆU
1.1. Lý do chọn đề tài 
Bối cảnh công nghệ thông tin ngày càng phát triển, nhu cầu sử dụng máy tính, đặc biệt là laptop và máy tính cá nhân (PC), ngày càng gia tăng mạnh mẽ. Người dùng không chỉ có nhu cầu mua sắm thiết bị mà còn mong muốn lựa chọn được sản phẩm phù hợp với mục đích sử dụng như học tập, làm việc, giải trí hay thiết kế đồ họa.
Tuy nhiên, thực tế cho thấy việc lựa chọn laptop hoặc tự xây dựng một bộ PC hoàn chỉnh gặp nhiều khó khăn do:
Người dùng thiếu kiến thức về phần cứng
Khó đánh giá hiệu năng giữa các linh kiện
Rủi ro không tương thích giữa các thành phần khi build PC
Bên cạnh đó, các website thương mại điện tử hiện nay chủ yếu chỉ dừng lại ở việc hiển thị và bán sản phẩm, chưa có khả năng hỗ trợ người dùng đưa ra quyết định một cách thông minh.
Vì vậy, việc xây dựng một hệ thống thương mại điện tử tích hợp trí tuệ nhân tạo (AI) để hỗ trợ gợi ý sản phẩm và cấu hình PC là cần thiết, giúp nâng cao trải nghiệm người dùng và tối ưu hóa quá trình mua sắm.
1.2. Mục tiêu đề tài
Mục tiêu của đề tài là xây dựng một website thương mại điện tử chuyên cung cấp laptop và linh kiện máy tính, đồng thời tích hợp hệ thống AI nhằm hỗ trợ người dùng lựa chọn sản phẩm phù hợp.
Cụ thể:
Xây dựng hệ thống bán hàng trực tuyến cho:
oLaptop
oLinh kiện máy tính (CPU, GPU, RAM, mainboard, nguồn, v.v.)
Phát triển các chức năng cơ bản:
oTìm kiếm, lọc sản phẩm
oQuản lý giỏ hàng và đặt hàng
Xây dựng chức năng build PC:
oCho phép người dùng lựa chọn từng linh kiện
oKiểm tra tính tương thích giữa các linh kiện
Tích hợp hệ thống AI:
oGợi ý laptop theo nhu cầu và ngân sách
oGợi ý cấu hình PC hoàn chỉnh
oTối ưu lựa chọn dựa trên hiệu năng và chi phí
1.3. Phạm vi đề tài
Phạm vi đề tài Đề tài tập trung xây dựng hệ thống với các phân hệ chức năng sau:
Phần Khách hàng (Client):
●Tài khoản: Đăng ký, Đăng nhập (Email/Google/Facebook), , Quản lý thông tin cá nhân, Sổ địa chỉ.
●Mua sắm: Xem danh sách sản phẩm (Lọc, Tìm kiếm), Xem chi tiết (Ảnh/Video, Đánh giá), Thêm vào Giỏ hàng,.
●Thanh toán: Đặt hàng trực tuyến, Thanh toán đa phương thức (COD, Thẻ quốc tế qua Stripe), Theo dõi trạng thái đơn hàng.
●Tương tác: Đánh giá và bình luận sản phẩm sau khi mua.

Phần Quản trị (Admin):
●Dashboard: Xem báo cáo thống kê doanh thu, số lượng đơn hàng, khách hàng mới.
●Quản lý Sản phẩm: Thêm, sửa, xóa sản phẩm; Quản lý kho hàng; Upload ảnh/video lên Cloud.
●Quản lý Đơn hàng: Xem chi tiết, Cập nhật trạng thái xử lý (Đang giao, Đã giao, Hủy).
●Quản lý Khách hàng: Xem danh sách người dùng, Lịch sử mua hàng.
●Quản lý Banner: Cập nhật banner quảng cáo và video trang chủ.

1.4 Đối tượng nghiên cứu
Đối tượng nghiên cứu là ứng dụng web thương mại điện tử cho cửa hàng bán laptop và linh kiện máy tính, bao gồm:
●Frontend (EJS): hiển thị giao diện người dùng, danh sách sản phẩm, giỏ hàng.
●Backend (Node.js + Express): xử lý logic nghiệp vụ, xác thực người dùng, quản lý sản phẩm và đơn hàng.
●Cơ sở dữ liệu (MongoDB): lưu trữ thông tin sản phẩm, tài khoản, đơn hàng.
Ngoài ra, đề tài cũng tìm hiểu mô hình client–server, RESTful API và các kỹ thuật bảo mật cơ bản trong web thương mại điện tử.
1.5. Phương pháp nghiên cứu
+ Nghiên cứu tài liệu: Tìm hiểu tài liệu về MERN Stack, mô hình REST API, và ứng dụng của Node.js – EJS – MongoDB.
+ Thực nghiệm: Lập trình, chạy thử, kiểm tra chức năng và tối ưu giao diện website.
+ Phân tích và thiết kế: Xây dựng sơ đồ chức năng, luồng xử lý, và mô hình dữ liệu hợp lý.
+ Đánh giá thực tế: So sánh với các website bán bán laptop và linh kiện máy tính có sẵn để đánh giá hiệu quả và khả năng mở rộng.
1.6. Bố cục đề tài
Đề tài được chia thành 3 chương chính:
Chương 1: Giới thiệu — Lý do chọn đề tài, mục tiêu, phạm vi, đối tượng và phương pháp nghiên cứu.
Chương 2: Cơ sở lý thuyết — Trình bày kiến thức và công nghệ sử dụng: Node.js, EJS, MongoDB, ExpressJS.
Chương 3: Phân tích và thiết kế hệ thống — Mô tả chức năng, sơ đồ luồng dữ liệu, cơ sở dữ liệu và giao diện website bán bán laptop và linh kiện máy tính.










CHƯƠNG 2. CƠ SỞ LÝ THUYẾT
Nhóm chúng tôi sử dụng ngôn ngữ lập trình JavaScript, kết hợp với Node.js, EJS, ExpressJS, MongoDB và môi trường phát triển Visual Studio Code để xây dựng và phát triển đề tài “Xây dựng website bán laptop và linh kiện máy tính”.
Ngôn ngữ JavaScript được lựa chọn vì cú pháp linh hoạt, dễ học, dễ đọc và có khả năng sử dụng được ở cả frontend lẫn backend, giúp tối ưu hóa quá trình phát triển ứng dụng web. Việc sử dụng cùng một ngôn ngữ cho toàn bộ hệ thống giúp cho lập trình viên dễ dàng quản lý mã nguồn, tăng tốc độ phát triển và giảm thiểu sai sót khi giao tiếp giữa các phần trong hệ thống.
Node.js là nền tảng chạy JavaScript phía máy chủ, được thiết kế để xử lý nhiều yêu cầu đồng thời một cách hiệu quả. ExpressJS, framework phổ biến của Node.js, giúp đơn giản hóa việc xây dựng API và xử lý định tuyến (routing). EJS (Embedded JavaScript) là một template engine cho phép nhúng mã JavaScript vào HTML để tạo giao diện động phía server. EJS thường được sử dụng kết hợp với ExpressJS trong các ứng dụng web sử dụng Node.js. Trong khi đó, MongoDB là hệ quản trị cơ sở dữ liệu NoSQL hiện đại, phù hợp với các ứng dụng web thương mại điện tử nhờ khả năng mở rộng linh hoạt và tốc độ truy xuất cao.
Môi trường phát triển Visual Studio Code (VS Code) được nhóm sử dụng nhờ tính gọn nhẹ, hỗ trợ nhiều phần mở rộng, tích hợp Git và khả năng chạy trực tiếp các ứng dụng Node.js, giúp quá trình lập trình trở nên nhanh chóng, thuận tiện và dễ kiểm thử.
Sự kết hợp giữa Node.js, EJS, ExpressJS, MongoDB và VS Code mang lại một giải pháp phát triển toàn diện và hiện đại, đáp ứng tốt nhu cầu của một hệ thống thương mại điện tử bán laptop và linh kiện máy tính. Bộ công cụ này giúp nhóm dễ dàng triển khai đầy đủ quy trình phát triển phần mềm – từ thiết kế giao diện, lập trình chức năng, kết nối cơ sở dữ liệu, đến kiểm thử và hoàn thiện sản phẩm – đồng thời rèn luyện kỹ năng lập trình web full-stack trong môi trường thực tế.

2.1. Ngôn ngữ lập trình JavaScript
2.1.1. Giới thiệu về JavaScript
JavaScript là ngôn ngữ lập trình thông dịch, được ra mắt lần đầu vào năm 1995 bởi Brendan Eich. Ban đầu, JavaScript chỉ được dùng để tạo hiệu ứng tương tác trên các trang web, nhưng hiện nay đã trở thành một trong ba ngôn ngữ cốt lõi của phát triển web cùng với HTML và CSS.
Nhờ sự ra đời của các công nghệ mới như Node.js và EJS, JavaScript đã vượt ra khỏi giới hạn frontend để trở thành một ngôn ngữ lập trình toàn diện cho cả phía client và server.
JavaScript hiện được sử dụng rộng rãi trong nhiều lĩnh vực như:
●Phát triển website và ứng dụng web động (EJS, Angular, VueJS).
●Lập trình backend (Node.js, ExpressJS).
●Phát triển giao diện web động bằng (EJS,ExpressJS).
●Xây dựng ứng dụng máy tính (Electron).
2.1.2. Ưu điểm của JavaScript trong phát triển website thương mại điện tử
●Đồng nhất ngôn ngữ: Sử dụng chung JavaScript cho cả frontend và backend giúp giảm độ phức tạp khi phát triển.
Hiệu năng cao: Nhờ cơ chế bất đồng bộ (asynchronous), Node.js có thể xử lý hàng ngàn yêu cầu mà không bị nghẽn.
●Cộng đồng lớn: Có rất nhiều thư viện và công cụ hỗ trợ, giúp rút ngắn thời gian phát triển.
●Tính linh hoạt: Phù hợp cho nhiều loại ứng dụng – từ web nhỏ đến hệ thống thương mại điện tử quy mô lớn.

2.1.3. Nhược điểm
●Bảo mật: Do tính chất mở, các ứng dụng JavaScript cần được bảo vệ kỹ càng khỏi tấn công XSS hoặc SQL Injection.x
●Hiệu năng: Với các tác vụ nặng (xử lý dữ liệu lớn hoặc đồ họa), hiệu năng của Node.js có thể kém hơn các ngôn ngữ biên dịch như C++ hoặc Java.
●Phụ thuộc vào thư viện: Nhiều dự án phụ thuộc vào package bên ngoài, cần quản lý chặt chẽ để tránh xung đột phiên bản.
2.2. Môi trường phát triển Visual Studio Code (VS Code)
Visual Studio Code là môi trường phát triển tích hợp (IDE) được Microsoft phát triển, hỗ trợ nhiều ngôn ngữ lập trình, đặc biệt là JavaScript, Node.js và EJS. Đây là công cụ chính mà nhóm sử dụng trong suốt quá trình xây dựng website bán laptop và linh kiện máy tính. VS Code cung cấp nhiều tính năng nổi bật như:
●Tự động gợi ý mã lệnh (IntelliSense): Giúp tăng tốc quá trình lập trình.
●Hệ thống gỡ lỗi (Debugging): Cho phép theo dõi luồng xử lý chương trình trực tiếp trong IDE.
●Tích hợp Git: Hỗ trợ làm việc nhóm và quản lý mã nguồn hiệu quả.
●Hệ sinh thái plugin phong phú: Dễ dàng cài đặt các tiện ích mở rộng như ESLint, Prettier, MongoDB, React Snippets...
●Chạy và kiểm thử Node.js trực tiếp: Không cần chuyển đổi môi trường.
Việc sử dụng VS Code giúp nhóm rút ngắn thời gian phát triển, dễ dàng kiểm tra lỗi và cải thiện chất lượng mã nguồn trong suốt quá trình làm việc.
2.3. Thư viện và framework hỗ trợ
Để phát triển hệ thống thương mại điện tử bán laptop và linh kiện máy tính, nhóm sử dụng các công nghệ và thư viện chính sau:
2.3.1. Node.js và ExpressJS
Node.js là nền tảng chạy JavaScript phía server, cho phép lập trình viên xây dựng các ứng dụng web hiệu năng cao. ExpressJS là framework phổ biến nhất của Node.js, cung cấp các công cụ mạnh mẽ giúp xây dựng RESTful API nhanh chóng, xử lý định tuyến, middleware, xác thực người dùng và kết nối với cơ sở dữ liệu.
Các tính năng chính:
●Xử lý HTTP request/response.
●Xây dựng API cho các chức năng như đăng nhập, giỏ hàng, đơn hàng.
●Kết nối và trao đổi dữ liệu với MongoDB.
●Quản lý bảo mật bằng JWT (JSON Web Token) và bcrypt.
2.3.2. EJS
●EJS là một template engine cho phép nhúng mã JavaScript vào HTML để tạo giao diện động phía server.
●
●Trong đề tài, EJS được sử dụng để xây dựng giao diện người dùng cho các chức năng như:
●- Trang chủ hiển thị sản phẩm
●- Trang danh sách sản phẩm
●- Trang chi tiết sản phẩm
●- Giỏ hàng và thanh toán
●- Trang quản trị (Admin)
●
●Ưu điểm của EJS:
●- Dễ sử dụng và tích hợp với ExpressJS
●- Render giao diện nhanh phía server
●- Phù hợp với các ứng dụng web thương mại điện tử vừa và nhỏ
●Việc sử dụng EJS giúp hệ thống đơn giản hơn so với các framework frontend phức tạp, đồng thời vẫn đảm bảo hiển thị dữ liệu động hiệu quả.
2.3.3. MongoDB
MongoDB là cơ sở dữ liệu NoSQL lưu trữ dữ liệu dưới dạng document JSON.
Khác với SQL truyền thống, MongoDB cho phép lưu trữ linh hoạt, dễ mở rộng và phù hợp cho các dự án web có cấu trúc dữ liệu thay đổi thường xuyên.
Các tính năng chính:
●Tốc độ truy vấn cao, hỗ trợ tìm kiếm nâng cao.
●Dễ mở rộng khi lượng sản phẩm và đơn hàng tăng.
●Tích hợp tốt với Node.js thông qua thư viện Mongoose.
Các bảng (collection) chính trong dự án:
●users: lưu thông tin khách hàng, mật khẩu mã hóa, vai trò (admin/khách).
●products: lưu danh mục sản phẩm website bán laptop và linh kiện máy tính (aptop, CPU, GPU, RAM, mainboard,…).
●orders: lưu thông tin đơn hàng, trạng thái, ngày đặt và tổng tiền.
●carts: Lưu giỏ hàng tạm thời của người dùng (để khi họ tắt máy mở lại vẫn còn hàng).
●reviews: Lưu đánh giá, bình luận và số sao của khách hàng cho từng sản phẩm.
●collections: Lưu các bộ sưu tập sản phẩm (ví dụ: "Bộ sưu tập Mùa Xuân", "Best Seller"...).
●herobanners: Quản lý các banner quảng cáo và video intro hiển thị trên trang chủ.
●promos: Lưu mã giảm giá, chương trình khuyến mãi.
●adminlogs: Ghi lại lịch sử hoạt động của Admin (ai vừa sửa gì, xóa gì...) để bảo mật và tra cứu.
●partners: Lưu thông tin đối tác/logo thương hiệu hiển thị ở chân trang.
2.3.4. Cloudinary 
Cloudinary là dịch vụ quản lý hình ảnh và video trên nền tảng đám mây (Cloud).
Vai trò: Lưu trữ toàn bộ hình ảnh sản phẩm, banner và video intro của website.
Lợi ích: Tự động tối ưu hóa dung lượng ảnh/video, giảm tải cho server chính, giúp website tải nhanh hơn và chịu được lượng truy cập lớn.
2.3.5. Hệ thống AI Build PC
Hệ thống AI là tính năng nổi bật của đề tài, giúp người dùng lựa chọn cấu hình PC phù hợp chỉ bằng cách mô tả bằng ngôn ngữ tự nhiên.

Công nghệ sử dụng:
●NLP (Natural Language Processing): Xử lý ngôn ngữ tự nhiên tiếng Việt, bao gồm tokenization (tách từ), loại bỏ stopwords (từ không quan trọng), và chuẩn hóa Unicode.
●Weighted Keywords System: Mỗi từ khóa có trọng số khác nhau để xác định mục đích sử dụng. Ví dụ: "gaming" (weight 5) quan trọng hơn "game" (weight 3).
●Rule-Based AI: Sử dụng hệ thống luật thay vì Machine Learning. Gaming ưu tiên GPU, Đồ họa ưu tiên CPU, Văn phòng không cần GPU mạnh.
●Budget Allocation: Phân bổ ngân sách động theo mục đích. Gaming: GPU 35%, CPU 20%; Đồ họa: CPU 25%, GPU 30%.
●Scoring Algorithm: Chấm điểm sản phẩm dựa trên giá (vừa vặn với budget), hiệu năng và độ khớp với yêu cầu.
●Compatibility Checking: Tự động kiểm tra tương thích socket CPU-Mainboard, RAM type, và GPU power-PSU.

Quy trình hoạt động:
1.User nhập: "Tôi muốn máy gaming 20 triệu"
2.NLP xử lý → Purpose: Gaming, Budget: 20M
3.Chọn template phù hợp và phân bổ budget
4.Chọn sản phẩm tốt nhất cho 7 linh kiện (CPU, GPU, RAM, Storage, Mainboard, PSU, Case)
5.Kiểm tra tương thích tự động
6.Trả về cấu hình hoàn chỉnh với lý do chọn từng linh kiện

2.3.6. Socket.io
Socket.io là thư viện JavaScript cho phép giao tiếp real-time hai chiều giữa client và server.
Vai trò: Hỗ trợ chat trực tuyến giữa khách hàng và admin, cập nhật trạng thái đơn hàng real-time.
Ưu điểm: Giao tiếp tức thời không cần refresh trang, hỗ trợ fallback khi WebSocket không khả dụng.

2.3.7. Các thư viện bảo mật
Để đảm bảo an toàn cho hệ thống, nhóm sử dụng các thư viện bảo mật sau:
●JWT (JSON Web Token): Xác thực người dùng bằng token mã hóa, không cần lưu session trên server.
●bcrypt: Mã hóa mật khẩu người dùng bằng thuật toán one-way hashing, không thể giải mã ngược.
●Helmet: Bảo vệ ứng dụng khỏi các lỗ hổng web phổ biến bằng cách thiết lập HTTP headers bảo mật.
●express-rate-limit: Giới hạn số lượng request từ một IP để ngăn chặn tấn công DDoS và brute-force.
●xss-clean: Ngăn chặn tấn công XSS (Cross-Site Scripting) bằng cách lọc ký tự đặc biệt trong input.
●express-mongo-sanitize: Ngăn chặn MongoDB Injection bằng cách loại bỏ ký tự đặc biệt trong query.

2.3.8. Công cụ phụ trợ khác
Ngoài các công nghệ chính, nhóm còn sử dụng:
●Postman: kiểm thử API backend.
●GitHub: quản lý mã nguồn và làm việc nhóm.
●Canva : thiết kế giao diện sản phẩm và banner trang chủ.
●Luma : Thiết kế video
●Draw.io: vẽ các bảng dữ liệu luồng hệ thống
●PlantUML: Phác thảo tham khảo các cách vẽ
2.4. Kết luận chương
Trong chương này, nhóm đã trình bày các kiến thức cơ sở lý thuyết liên quan đến việc phát triển website thương mại điện tử bán laptop và linh kiện máy tính. Việc kết hợp các công nghệ hiện đại như Node.js, EJS, ExpressJS và MongoDB cùng với hệ thống AI sử dụng NLP và Rule-Based approach giúp hệ thống không chỉ đạt được hiệu năng cao, giao diện hiện đại, mà còn có khả năng gợi ý thông minh và tự động hóa quy trình lựa chọn sản phẩm.

Đặc biệt, tính năng AI Build PC là điểm nổi bật của đề tài, giúp người dùng dễ dàng xây dựng cấu hình PC phù hợp chỉ bằng cách mô tả bằng ngôn ngữ tự nhiên. Bên cạnh đó, các thư viện bảo mật như JWT, bcrypt, Helmet đảm bảo an toàn cho hệ thống, và Socket.io hỗ trợ giao tiếp real-time giữa khách hàng và admin.

Đây là nền tảng vững chắc cho quá trình phân tích – thiết kế – lập trình – kiểm thử được trình bày trong chương tiếp theo.