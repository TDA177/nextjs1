const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Couple Planner data (Anh & Em)...');

  // Clear existing
  await prisma.notification.deleteMany();
  await prisma.plannerAttachment.deleteMany();
  await prisma.plannerComment.deleteMany();
  await prisma.plannerEvent.deleteMany();
  await prisma.plannerChecklist.deleteMany();
  await prisma.plannerItem.deleteMany();

  const now = new Date();
  const dec2027 = new Date('2027-12-30T00:00:00.000Z');
  const dec2026 = new Date('2026-12-30T00:00:00.000Z');
  const nov2026 = new Date('2026-11-10T00:00:00.000Z');

  // 1. Kỷ niệm ngày yêu nhau (25/12/2025)
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Kỷ niệm ngày yêu nhau ❤️',
      description: 'Ngày hai đứa chính thức bên nhau 25/12/2025.',
      type: 'Anniversary',
      status: 'Planned',
      priority: 'Critical',
      startDate: new Date('2025-12-25T00:00:00.000Z'),
      color: 'Hồng',
      createdBy: 'Anh',
      assignedTo: 'Both',
      isRepeat: true,
      repeatRule: 'Every Year'
    }
  });

  // 2. Sinh nhật Em (05/03/2004)
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Sinh nhật Em 🎂',
      description: 'Sinh nhật của Em (05/03/2004).',
      type: 'Birthday',
      status: 'Planned',
      priority: 'High',
      startDate: new Date('2004-03-05T00:00:00.000Z'),
      color: 'Vàng',
      createdBy: 'Anh',
      assignedTo: 'Em',
      isRepeat: true,
      repeatRule: 'Every Year'
    }
  });

  // 3. Sinh nhật Anh (17/07/2001)
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Sinh nhật Anh 🎂',
      description: 'Sinh nhật của Anh (17/07/2001).',
      type: 'Birthday',
      status: 'Planned',
      priority: 'High',
      startDate: new Date('2001-07-17T00:00:00.000Z'),
      color: 'Vàng',
      createdBy: 'Em',
      assignedTo: 'Anh',
      isRepeat: true,
      repeatRule: 'Every Year'
    }
  });

  // Item 4: Bucket - Đi Nhật
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Đi Nhật Bản',
      description: 'Du lịch mùa hoa anh đào tại Kyoto và Tokyo 7 ngày 6 đêm.',
      type: 'Bucket',
      status: 'In Progress',
      priority: 'High',
      deadline: dec2027,
      color: 'Hồng',
      createdBy: 'Anh',
      assignedTo: 'Both',
      isRepeat: false,
      checklists: {
        create: [
          { title: 'Xin Visa du lịch', isCompleted: true, sortOrder: 1 },
          { title: 'Mua vé máy bay khứ hồi', isCompleted: true, sortOrder: 2 },
          { title: 'Đặt khách sạn Tokyo & Kyoto', isCompleted: true, sortOrder: 3 },
          { title: 'Đổi tiền Yên (JPY)', isCompleted: false, sortOrder: 4 },
          { title: 'Mua SIM 4G du lịch', isCompleted: false, sortOrder: 5 }
        ]
      },
      events: {
        create: [
          {
            title: 'Đặt vé máy bay khứ hồi',
            eventStart: nov2026,
            isAllDay: true,
            isCompleted: true
          },
          {
            title: 'Khởi hành chuyến bay đi Tokyo',
            eventStart: new Date('2027-04-10T09:00:00.000Z'),
            eventEnd: new Date('2027-04-10T16:00:00.000Z'),
            isAllDay: false,
            isCompleted: false
          }
        ]
      },
      comments: {
        create: [
          {
            userId: 'user_anh',
            userName: 'Anh',
            content: 'Đặt khách sạn chưa em?'
          },
          {
            userId: 'user_em',
            userName: 'Em',
            content: 'Mai em đặt nha ❤️ Em đã chọn được homestay view núi Phú Sĩ rùi!'
          }
        ]
      },
      attachments: {
        create: [
          {
            name: 'Lịch trình dự kiến Tokyo-Kyoto.pdf',
            url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=60',
            fileType: 'pdf'
          },
          {
            name: 'Xác nhận đặt vé Vietnam Airlines.png',
            url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60',
            fileType: 'ticket'
          }
        ]
      }
    }
  });

  // Item 5: Bucket - Chuẩn bị cưới
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Chuẩn bị đám cưới',
      description: 'Lên kế hoạch tổ chức tiệc cưới và chụp ảnh cưới lãng mạn.',
      type: 'Bucket',
      status: 'In Progress',
      priority: 'Critical',
      deadline: dec2026,
      color: 'Đỏ',
      createdBy: 'Em',
      assignedTo: 'Both',
      events: {
        create: [
          {
            title: 'Đi thử váy cưới',
            eventStart: new Date(now.getTime() + 2 * 86400000),
            isAllDay: false,
            isCompleted: false
          },
          {
            title: 'Chụp ảnh cưới tại Da Lat',
            eventStart: new Date(now.getTime() + 10 * 86400000),
            isAllDay: true,
            isCompleted: false
          },
          {
            title: 'Đặt nhà hàng tiệc cưới',
            eventStart: new Date(now.getTime() + 25 * 86400000),
            isAllDay: true,
            isCompleted: false
          }
        ]
      },
      checklists: {
        create: [
          { title: 'Lên danh sách khách mời', isCompleted: true, sortOrder: 1 },
          { title: 'Chọn nhẫn cưới', isCompleted: true, sortOrder: 2 },
          { title: 'Gửi thiệp mời', isCompleted: false, sortOrder: 3 }
        ]
      }
    }
  });

  // Item 6: Event - Đi xem phim
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Đi xem phim cuối tuần 🎬',
      description: 'Xem phim chiếu rạp rạp CGV Vincom.',
      type: 'Event',
      status: 'Planned',
      priority: 'Medium',
      startDate: new Date(now.getTime() + 3 * 86400000),
      color: 'Tím',
      createdBy: 'Anh',
      assignedTo: 'Both'
    }
  });

  // Item 7: Bucket - Đi Đà Lạt ✈️
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Đi Đà Lạt ✈️',
      description: 'Du lịch 3 ngày 2 đêm săn mây và đi cà phê.',
      type: 'Bucket',
      status: 'Planned',
      priority: 'High',
      deadline: dec2026,
      color: 'Hồng',
      createdBy: 'Anh',
      assignedTo: 'Both',
      checklists: {
        create: [
          { title: 'Thuê xe máy', isCompleted: false, sortOrder: 1 },
          { title: 'Lên danh sách quán cà phê đẹp', isCompleted: true, sortOrder: 2 }
        ]
      }
    }
  });

  // Item 8: Bucket không có ngày (Rule 1: Maldives)
  await prisma.plannerItem.create({
    data: {
      coupleId: 'couple-1',
      title: 'Muốn đi Maldives 🌴',
      description: 'Nghỉ dưỡng resort trên biển ngắm san hô (Chưa biết khi nào).',
      type: 'Bucket',
      status: 'Planned',
      priority: 'Low',
      color: 'Xanh',
      createdBy: 'Em',
      assignedTo: 'Both'
    }
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        coupleId: 'couple-1',
        userId: 'user_anh',
        type: 'deadline_reminder',
        title: 'Nhắc nhở hạn Bucket: Đi Nhật',
        message: 'Bucket "Đi Nhật Bản" còn 30 ngày nữa là đến hạn!',
        isRead: false
      },
      {
        coupleId: 'couple-1',
        userId: 'user_em',
        type: 'event_soon',
        title: 'Sự kiện sắp diễn ra',
        message: 'Sự kiện "Đi thử váy cưới" sẽ diễn ra trong 2 ngày tới.',
        isRead: false
      }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
