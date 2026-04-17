const apiBaseUrl = `${window.location.origin}/api`;
const loginUrl = `${window.location.origin}/api/auth/discord/login`;
const loginBtn = document.querySelector('#loginBtn');
const logoutBtn = document.querySelector('#logoutBtn');
const userInfo = document.querySelector('#userInfo');
const userAvatar = document.querySelector('#userAvatar');
const userName = document.querySelector('#userName');
const userDiscriminator = document.querySelector('#userDiscriminator');
const navMenu = document.querySelector('#navMenu');
const navBtns = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');
const productList = document.querySelector('#productList');
const orderList = document.querySelector('#orderList');
const adminProductList = document.querySelector('#adminProductList');
const createProductBtn = document.querySelector('#createProductBtn');
const productModal = document.querySelector('#productModal');
const closeModalBtn = document.querySelector('#closeModalBtn');
const cancelBtn = document.querySelector('#cancelBtn');
const productForm = document.querySelector('#productForm');
const productGuild = document.querySelector('#productGuild');
const productChannel = document.querySelector('#productChannel');
const connectMPBtn = document.querySelector('#connectMPBtn');
const mpAccessToken = document.querySelector('#mpAccessToken');
const serverList = document.querySelector('#serverList');
const logsList = document.querySelector('#logsList');
const guildSelect = document.querySelector('#guildSelect');
const botName = document.querySelector('#botName');
const botLogo = document.querySelector('#botLogo');
const botCover = document.querySelector('#botCover');
const saveBotConfigBtn = document.querySelector('#saveBotConfigBtn');
const discordClientId = '1493935131256295576';

let currentUser = null;
let userGuilds = [];

// Verificar se está rodando no domínio correto
if (window.location.origin !== 'http://localhost:3000') {
  productList.innerText = 'Abra este painel via http://localhost:3000, não via Live Server.';
  orderList.innerText = 'Login Discord só funciona se o frontend rodar no mesmo domínio do backend.';
  loginBtn.disabled = true;
}

async function fetchJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  return response.json();
}

async function checkAuth() {
  try {
    const data = await fetchJson(`${apiBaseUrl}/auth/me`);
    if (data.authenticated && data.user) {
      currentUser = data.user;
      userGuilds = data.guilds || [];
      showLoggedInState(data.user);
      return true;
    } else {
      showLoggedOutState();
      return false;
    }
  } catch (err) {
    console.error('Erro ao verificar autenticação:', err);
    showLoggedOutState();
    return false;
  }
}

function showLoggedInState(user) {
  loginBtn.style.display = 'none';
  userInfo.style.display = 'flex';
  navMenu.style.display = 'flex';

  if (user.avatar) {
    userAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  } else {
    userAvatar.src = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
  }

  userName.textContent = user.username;
  userDiscriminator.textContent = `#${user.discriminator}`;

  // Carregar dados do usuário
  loadProducts();
  loadOrders();
  loadAdminProducts();
  loadServers();
  loadGuildSelect();
  loadLogs();
}

function showLoggedOutState() {
  loginBtn.style.display = 'block';
  userInfo.style.display = 'none';
  navMenu.style.display = 'none';
  currentUser = null;
  userGuilds = [];

  // Mostrar apenas dashboard público
  panels.forEach(panel => panel.classList.remove('active'));
  document.querySelector('#dashboard').classList.add('active');
  navBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector('[data-section="dashboard"]').classList.add('active');

  loadProducts();
  orderList.innerText = 'Faça login para ver seus pedidos.';
}

async function loadProducts() {
  try {
    const products = await fetchJson(`${apiBaseUrl}/products`);
    if (!Array.isArray(products)) {
      productList.innerText = 'Não foi possível carregar produtos.';
      return;
    }

    if (products.length === 0) {
      productList.innerHTML = '<p>Nenhum produto cadastrado ainda.</p>';
      return;
    }

    productList.innerHTML = products.filter(p => p.active).map(product => `
      <div class="product-card">
        <strong>${product.name}</strong>
        <p>${product.description}</p>
        <p>💰 R$ ${(product.priceCents / 100).toFixed(2)}</p>
        <p>📦 Estoque: ${product.stock}</p>
        ${currentUser ? `<button class="buy-btn" onclick="buyProduct(${product.id})">Comprar</button>` : ''}
      </div>
    `).join('');
  } catch (err) {
    productList.innerText = 'Erro ao carregar produtos.';
  }
}

async function loadOrders() {
  if (!currentUser) return;

  try {
    const orders = await fetchJson(`${apiBaseUrl}/orders/me`);
    if (!Array.isArray(orders) || orders.length === 0) {
      orderList.innerText = 'Nenhum pedido encontrado.';
      return;
    }
    orderList.innerHTML = orders.map(order => `
      <div class="order-card">
        <strong>Pedido #${order.id}</strong>
        <p>Produto: ${order.Product?.name || 'Desconhecido'}</p>
        <p>Total: R$ ${(order.totalCents / 100).toFixed(2)}</p>
        <p>Status: <span class="status-pill">${order.status}</span></p>
      </div>
    `).join('');
  } catch (err) {
    orderList.innerText = 'Erro ao carregar pedidos.';
  }
}

async function loadAdminProducts() {
  if (!currentUser) return;

  try {
    const products = await fetchJson(`${apiBaseUrl}/products`);
    if (!Array.isArray(products)) {
      adminProductList.innerText = 'Erro ao carregar produtos.';
      return;
    }

    adminProductList.innerHTML = products.map(product => `
      <div class="product-card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <strong>${product.name}</strong>
            <p>${product.description}</p>
            <p>💰 R$ ${(product.priceCents / 100).toFixed(2)}</p>
            <p>📦 Estoque: ${product.stock}</p>
            <p>📊 Status: ${product.active ? 'Ativo' : 'Inativo'}</p>
          </div>
          <div>
            <button class="action-btn" onclick="editProduct(${product.id})" style="margin-bottom: 8px;">Editar</button>
            <button class="cancel-btn" onclick="toggleProduct(${product.id}, ${!product.active})">
              ${product.active ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    adminProductList.innerText = 'Erro ao carregar produtos.';
  }
}

async function loadServers() {
  if (!currentUser) return;

  try {
    const guilds = await fetchJson(`${apiBaseUrl}/admin/discord/guilds`);
    if (!Array.isArray(guilds) || guilds.length === 0) {
      serverList.innerHTML = '<p>Nenhum servidor encontrado. Faça login novamente e verifique se você está em servidores do Discord.</p>';
      productGuild.innerHTML = '<option value="">Nenhum servidor disponível</option>';
      productChannel.innerHTML = '<option value="">Selecione um servidor primeiro</option>';
      productChannel.disabled = true;
      return;
    }

    userGuilds = guilds;
    serverList.innerHTML = guilds.map(guild => {
      const iconUrl = guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
      const statusClass = guild.botInstalled ? 'server-status online' : 'server-status offline';
      const actionButton = guild.botInstalled
        ? `<button class="action-btn" onclick="manageServer('${guild.id}')">Gerenciar</button>`
        : `<a class="invite-btn" href="https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(DISCORD_CLIENT_ID)}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true" target="_blank" rel="noopener noreferrer">Convidar Bot</a>`;

      return `
        <div class="server-card">
          <img class="server-avatar" src="${iconUrl}" alt="${guild.name}">
          <div class="server-details">
            <strong>${guild.name}</strong>
            <p>${guild.owner ? 'Você é o dono' : ''} ${guild.botInstalled ? 'Bot conectado' : 'Bot ausente'}</p>
            <span class="${statusClass}">${guild.botInstalled ? 'Bot ativo' : 'Bot ausente'}</span>
          </div>
          <div class="server-actions">${actionButton}</div>
        </div>
      `;
    }).join('');

    const botGuilds = guilds.filter(guild => guild.botInstalled);
    productGuild.innerHTML = '<option value="">Selecionar servidor...</option>' + botGuilds.map(guild => `
      <option value="${guild.id}">${guild.name}</option>
    `).join('');
    productChannel.innerHTML = '<option value="">Selecione um servidor primeiro</option>';
    productChannel.disabled = botGuilds.length === 0;
  } catch (err) {
    console.error('Erro ao carregar servidores:', err);
    serverList.innerText = 'Erro ao carregar servidores.';
    productChannel.innerHTML = '<option value="">Erro ao carregar canais</option>';
    productChannel.disabled = true;
  }
}

function manageServer(guildId) {
  const productsButton = document.querySelector('[data-section="products"]');
  productsButton.click();
  productForm.reset();
  document.querySelector('#modalTitle').textContent = 'Criar Produto para servidor';
  productModal.style.display = 'flex';
  productGuild.value = guildId;
  loadChannelsForGuild(guildId);
}

async function loadChannelsForGuild(guildId) {
  if (!guildId) {
    productChannel.innerHTML = '<option value="">Selecione um servidor primeiro</option>';
    productChannel.disabled = true;
    return;
  }

  try {
    const channels = await fetchJson(`${apiBaseUrl}/admin/discord/guilds/${guildId}/channels`);
    if (!Array.isArray(channels) || channels.length === 0) {
      productChannel.innerHTML = '<option value="">Nenhum canal disponível</option>';
      productChannel.disabled = true;
      return;
    }

    productChannel.innerHTML = '<option value="">Selecionar canal...</option>' + channels.map(channel => `
      <option value="${channel.id}">${channel.name}</option>
    `).join('');
    productChannel.disabled = false;
  } catch (err) {
    console.error('Erro ao carregar canais:', err);
    productChannel.innerHTML = '<option value="">Erro ao carregar canais</option>';
    productChannel.disabled = true;
  }
}

async function loadGuildSelect() {
  if (!currentUser) return;

  try {
    const guilds = await fetchJson(`${apiBaseUrl}/admin/discord/guilds`);
    if (!Array.isArray(guilds) || guilds.length === 0) {
      guildSelect.innerHTML = '<option value="">Nenhum servidor disponível</option>';
      return;
    }

    guildSelect.innerHTML = '<option value="">Selecione um servidor...</option>' + guilds.map(guild => `
      <option value="${guild.id}">${guild.name}</option>
    `).join('');
  } catch (err) {
    console.error('Erro ao carregar servidores para config:', err);
    guildSelect.innerHTML = '<option value="">Erro ao carregar servidores</option>';
  }
}

async function loadLogs() {
  if (!currentUser) return;

  const guildId = document.getElementById('logsGuildSelect').value;
  if (!guildId) {
    logsList.innerHTML = '<p class="empty-state">Selecione um servidor para ver os logs</p>';
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/admin/logs/${guildId}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar logs');
    }

    const logs = await response.json();

    if (logs.length === 0) {
      logsList.innerHTML = '<p class="empty-state">Nenhum log registrado</p>';
      return;
    }

    logsList.innerHTML = logs.map(log => `
      <div class="log-item">
        <div class="log-header">
          <span class="log-level log-${log.level}">${log.level.toUpperCase()}</span>
          <span class="log-action">${log.action}</span>
          <span class="log-time">${new Date(log.createdAt).toLocaleString()}</span>
        </div>
        <div class="log-details">${log.details}</div>
        ${log.userId ? `<div class="log-user">Usuário: ${log.userId}</div>` : ''}
      </div>
    `).join('');
  } catch (err) {
    console.error('Erro ao carregar logs:', err);
    logsList.innerHTML = '<p class="error">Erro ao carregar logs.</p>';
  }
}

async function buyProduct(productId) {
  if (!currentUser) {
    alert('Faça login para comprar produtos.');
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/orders`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    if (response.ok) {
      const order = await response.json();
      alert(`Pedido criado! Use o link de pagamento: ${order.payment.paymentUrl}`);
      loadOrders();
    } else {
      const error = await response.json();
      alert(`Erro: ${error.message}`);
    }
  } catch (err) {
    alert('Erro ao criar pedido.');
  }
}

function editProduct(productId) {
  // Implementar edição de produto
  alert('Edição de produto será implementada em breve.');
}

async function toggleProduct(productId, active) {
  try {
    const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });

    if (response.ok) {
      loadAdminProducts();
    } else {
      alert('Erro ao alterar status do produto.');
    }
  } catch (err) {
    alert('Erro ao alterar status do produto.');
  }
}

// Event listeners
loginBtn.addEventListener('click', () => {
  window.location.href = loginUrl;
});

logoutBtn.addEventListener('click', async () => {
  try {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    showLoggedOutState();
  } catch (err) {
    console.error('Erro ao fazer logout:', err);
  }
});

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;

    // Update active nav button
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show corresponding panel
    panels.forEach(panel => panel.classList.remove('active'));
    document.querySelector(`#${section}`).classList.add('active');
  });
});

createProductBtn.addEventListener('click', () => {
  productForm.reset();
  document.querySelector('#modalTitle').textContent = 'Criar Produto';
  productModal.style.display = 'flex';

  if (productGuild.value) {
    loadChannelsForGuild(productGuild.value);
  } else {
    productChannel.innerHTML = '<option value="">Selecione um servidor primeiro</option>';
    productChannel.disabled = true;
  }
});

productGuild.addEventListener('change', () => {
  loadChannelsForGuild(productGuild.value);
});

closeModalBtn.addEventListener('click', () => {
  productModal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  productModal.style.display = 'none';
});

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productData = {
    name: document.querySelector('#productName').value,
    description: document.querySelector('#productDescription').value,
    priceCents: Math.round(parseFloat(document.querySelector('#productPrice').value) * 100),
    stock: parseInt(document.querySelector('#productStock').value) || 9999,
    imageUrl: document.querySelector('#productImage').value || null,
    announcementGuildId: document.querySelector('#productGuild').value || null,
    announcementChannelId: document.querySelector('#productChannel').value || null,
    active: true,
    deliveryType: 'automatica',
    currency: 'BRL'
  };

  try {
    const response = await fetch(`${apiBaseUrl}/products`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (response.ok) {
      const product = await response.json();
      productModal.style.display = 'none';
      loadAdminProducts();
      loadProducts();

      // Anunciar no canal se selecionado
      const channelId = productChannel.value;
      if (channelId) {
        announceProduct(product, channelId);
      }
    } else {
      const error = await response.json();
      alert(`Erro: ${error.message}`);
    }
  } catch (err) {
    alert('Erro ao criar produto.');
  }
});

async function loadChannels() {
  if (!userGuilds.length || !productGuild.value) return;
  await loadChannelsForGuild(productGuild.value);
}

async function announceProduct(product, channelId) {
  // Implementar anúncio via bot
  console.log('Anunciar produto:', product, 'no canal:', channelId);
}

connectMPBtn.addEventListener('click', async () => {
  const token = mpAccessToken.value.trim();
  if (!token) {
    alert('Digite o Access Token do Mercado Pago.');
    return;
  }

  try {
    // Implementar conexão com Mercado Pago
    alert('Conexão com Mercado Pago será implementada em breve.');
  } catch (err) {
    alert('Erro ao conectar com Mercado Pago.');
  }
});

guildSelect.addEventListener('change', async () => {
  const guildId = guildSelect.value;
  if (!guildId) {
    botName.value = '';
    botLogo.value = '';
    botCover.value = '';
    return;
  }

  try {
    const config = await fetchJson(`${apiBaseUrl}/admin/guild-config/${guildId}`);
    botName.value = config.botName || '';
    botLogo.value = config.botLogo || '';
    botCover.value = config.botCover || '';
  } catch (err) {
    console.error('Erro ao carregar config do bot:', err);
  }
});

saveBotConfigBtn.addEventListener('click', async () => {
  const guildId = guildSelect.value;
  if (!guildId) {
    alert('Selecione um servidor primeiro.');
    return;
  }

  const configData = {
    guildId,
    botName: botName.value.trim() || null,
    botLogo: botLogo.value.trim() || null,
    botCover: botCover.value.trim() || null
  };

  try {
    const response = await fetch(`${apiBaseUrl}/admin/guild-config`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });

    if (response.ok) {
      alert('Configurações salvas com sucesso!');
    } else {
      const error = await response.json();
      alert(`Erro: ${error.message}`);
    }
  } catch (err) {
    alert('Erro ao salvar configurações.');
  }
});

// Inicialização
checkAuth();
