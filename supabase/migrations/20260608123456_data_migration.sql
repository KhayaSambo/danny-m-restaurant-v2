-- Data Migration: Customers and Orders

-- Customer Khaya Sambo (khayasambo@gmail.com) already exists in auth.users, skipping user insert but creating profile...
INSERT INTO public.profiles (
      id,
      phone,
      points,
      created_at
    ) VALUES (
      'ba9d49a0-beb1-45bb-8017-3fbda5dd9720',
      '0792745115',
      0,
      '2026-05-23T13:15:55.025Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Thabo Molefe (cmppwu3d7001fswismn5xefal)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      '6d2664b7-1c38-d456-f1e1-44ff37d4ea9d',
      NULL,
      180,
      'Completed',
      NULL,
      '{"customerName":"Thabo Molefe","customerPhone":"0721234567","customerEmail":null,"type":"Walk-in","deliveryAddress":null,"vatAmount":0,"items":[{"quantity":2,"menuItemId":"cmppwu2yt0002swistv1a554k","bundleDealId":null,"specialOfferId":null,"priceAtTime":0}]}'::jsonb,
      '2026-05-28T19:52:54.667Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Lerato Khumalo (cmppwu3e2001iswis58l56fgf)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      'f75244b7-911e-d99e-cf79-0b0d7c4e247c',
      NULL,
      155,
      'Completed',
      'Please call when outside',
      '{"customerName":"Lerato Khumalo","customerPhone":"0839876543","customerEmail":null,"type":"Delivery","deliveryAddress":"123 Mandela St, Soweto, Johannesburg","vatAmount":0,"items":[{"quantity":1,"menuItemId":"cmppwu2z40004swisdv5qf4od","bundleDealId":null,"specialOfferId":null,"priceAtTime":0},{"quantity":1,"menuItemId":"cmppwu3bz001eswis9g1b50lc","bundleDealId":null,"specialOfferId":null,"priceAtTime":0}]}'::jsonb,
      '2026-05-28T19:52:54.698Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Sipho Dlamini (cmppwu3eq001mswisvid2bmma)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      '72c899ea-b259-32c3-375e-891a7a0d16fa',
      NULL,
      90,
      'Completed',
      NULL,
      '{"customerName":"Sipho Dlamini","customerPhone":"0615550123","customerEmail":null,"type":"Walk-in","deliveryAddress":null,"vatAmount":0,"items":[{"quantity":1,"menuItemId":"cmppwu3030006swis6bb4ewrs","bundleDealId":null,"specialOfferId":null,"priceAtTime":0}]}'::jsonb,
      '2026-05-28T19:52:54.721Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Zanele Mbeki (cmppwu3fu001pswisik3h3qt0)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      'b87e8e9f-ce0e-a211-6b1a-21d0dd176350',
      NULL,
      245,
      'Completed',
      NULL,
      '{"customerName":"Zanele Mbeki","customerPhone":"0798881234","customerEmail":null,"type":"Delivery","deliveryAddress":"45 Olive Branch Ave, Sandton","vatAmount":0,"items":[{"quantity":2,"menuItemId":"cmppwu30y0008swisazar71gj","bundleDealId":null,"specialOfferId":null,"priceAtTime":0},{"quantity":1,"menuItemId":"cmppwu3b5001cswiskqhgmdrl","bundleDealId":null,"specialOfferId":null,"priceAtTime":0}]}'::jsonb,
      '2026-05-28T19:52:54.762Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Walk-in (Cash) (cmppxb3qp0003co6ed036q3oh)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      'b5b727b7-f8b4-3f3c-98be-783b1ec6bb35',
      NULL,
      173.65,
      'Completed',
      'POS Transaction TXN-768260',
      '{"customerName":"Walk-in (Cash)","customerPhone":"","customerEmail":"","type":"Walk-in","deliveryAddress":null,"vatAmount":0,"items":[{"quantity":1,"menuItemId":"cmppwu3b5001cswiskqhgmdrl","bundleDealId":null,"specialOfferId":null,"priceAtTime":46},{"quantity":1,"menuItemId":"cmppwu31i000aswis6hqi2s4a","bundleDealId":null,"specialOfferId":null,"priceAtTime":105}]}'::jsonb,
      '2026-05-28T20:06:08.304Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Walk-in (Cash) (cmppxc3lm0007co6egmo3fo27)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      'c2fb3a5c-226c-6a70-8873-75ab29d450ca',
      NULL,
      103.5,
      'Completed',
      'POS Transaction TXN-814728',
      '{"customerName":"Walk-in (Cash)","customerPhone":"","customerEmail":"","type":"Walk-in","deliveryAddress":null,"vatAmount":0,"items":[{"quantity":1,"menuItemId":"cmppwu31i000aswis6hqi2s4a","bundleDealId":null,"specialOfferId":null,"priceAtTime":90}]}'::jsonb,
      '2026-05-28T20:06:54.779Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Test Customer (cmpsmhdel000011etw6h3ngnl)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      '24285ed4-c9fd-96e1-4ae1-014d961c9acb',
      NULL,
      26,
      'Completed',
      'Test Order',
      '{"customerName":"Test Customer","customerPhone":"","customerEmail":"","type":"Pickup","deliveryAddress":null,"vatAmount":0,"items":[{"quantity":1,"menuItemId":"cmppwu39o0016swisudkb804k","bundleDealId":null,"specialOfferId":null,"priceAtTime":26}]}'::jsonb,
      '2026-05-30T17:26:23.515Z'
    ) ON CONFLICT (id) DO NOTHING;

-- Insert order: Test Customer with Custom Item (cmpsmhyc9000311et5jxdkfu3)
INSERT INTO public.orders (
      id,
      user_id,
      total,
      status,
      notes,
      items,
      created_at
    ) VALUES (
      '7f9dd8ee-ea7c-0d4e-47d6-d9049398952c',
      NULL,
      156.4,
      'Completed',
      'Test Order with Custom Item',
      '{"customerName":"Test Customer with Custom Item","customerPhone":"","customerEmail":"","type":"Pickup","deliveryAddress":null,"vatAmount":0,"items":[{"quantity":1,"menuItemId":null,"bundleDealId":null,"specialOfferId":null,"priceAtTime":156.4}]}'::jsonb,
      '2026-05-30T17:26:50.649Z'
    ) ON CONFLICT (id) DO NOTHING;

