const apiBaseUrl = 'http://localhost:3000/api';
const discordClientId = '1493935131256295576';
let currentUser = null;
let userGuilds = [];

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkAuth();
});

// ===== Event Listeners =====
function setupEventListeners() {
  // Login/Logout
  document.getElementById('loginBtn').addEventListener('click', () => {
    window.location.href = `${apiBaseUrl}/auth/discord/login`;
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateToPage(page);
    });
  });

  // Quick Start
  document.getElementById('quickStartBtn').addEventListener('click', () => {
    document.getElementById('loginBtn').click();
  });

  // Products
  document.getElementById('createProductBtn').addEventListener('click', openProductModal);
  document.getElementById('productForm').addEventListener('submit', handleCreateProduct);
  document.querySelector('.modal-close').addEventListener('click', closeProductModal);
  document.getElementById('productGuild').addEventListener('change', () => {
    loadChannelsForGuild(document.getElementById('productGuild').value);
  });

  // Settings
  document.getElementById('botConfigForm').addEventListener('submit', handleBotConfigSave);
  document.getElementById('settingsGuildSelect').addEventListener('change', loadBotConfig);

  // Logs
  document.getElementById('logsGuildSelect').addEventListener('change', loadLogs);

  // Modal close on outside click
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') closeProductModal();
  });

  // Invite Bot
  document.getElementById('inviteBotBtn').addEventListener('click', (e) => {
    e.preventDefault();
    window.open(`https://discord.com/oauth2/authorize?client_id=${discordClientId}&permissions=8&scope=bot%20applications.commands`, '_blank');
  });
}

// ===== Authentication =====
async function checkAuth() {
  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' });
    const data = await response.json();

    if (data.authenticated && data.user) {
      currentUser = data.user;
      userGuilds = data.guilds || [];
      showLoggedInState();
    } else {
      showLoggedOutState();
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    showLoggedOutState();
  }
}

function showLoggedInState() {
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('userCard').style.display = 'flex';
  document.querySelector('.sidebar-nav').style.display = 'flex';

  const avatarUrl = currentUser.avatar
    ? `https://cdn.discordapp.com/avatars/${currentUser.discordId}/${currentUser.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${(currentUser.discordId % 5)}.png`;

  document.getElementById('sidebarAvatar').src = avatarUrl;
  document.getElementById('sidebarUsername').textContent = currentUser.username;
  document.getElementById('sidebarDiscriminator').textContent = currentUser.discriminator;

  // Carrega dados
  loadDashboard();
  loadServers();
  loadProducts();
  loadOrders();
  updateGuildSelects();
}

function showLoggedOutState() {
  document.getElementById('loginBtn').style.display = 'block';
  document.getElementById('userCard').style.display = 'none';
  document.querySelector('.sidebar-nav').style.display = 'none';
  currentUser = null;
}

async function logout() {
  await fetch(`${apiBaseUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
  showLoggedOutState();
  navigateToPage('dashboard');
}

// ===== Navigation =====
function navigateToPage(pageName) {
  // Update page visibility
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`${pageName}-page`)?.classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

  // Update title
  const titles = {
    dashboard: 'Dashboard',
    servers: 'Servidores',
    products: 'Produtos',
    orders: 'Pedidos',
    settings: 'Configurações',
    logs: 'Logs'
  };
  document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';

  // Load page data
  if (pageName === 'logs') {
    loadLogs();
  }
}

// ===== Dashboard =====
async function loadDashboard() {
  try {
    const [products, orders] = await Promise.all([
      fetch(`${apiBaseUrl}/products`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${apiBaseUrl}/orders/me`, { credentials: 'include' }).then(r => r.json())
    ]);

    document.getElementById('totalProducts').textContent = Array.isArray(products) ? products.length : 0;
    document.getElementById('totalOrders').textContent = Array.isArray(orders) ? orders.length : 0;
    document.getElementById('totalServers').textContent = userGuilds.length;

    // Recent products
    const recentProducts = Array.isArray(products) ? products.slice(0, 3) : [];
    const html = recentProducts.length > 0
      ? recentProducts.map(p => `
          <div class="list-item">
            <div>
              <strong>${p.name}</strong>
              <div style="font-size: 0.875rem; color: var(--text-secondary);">R$ ${(p.priceCents / 100).toFixed(2)} • Estoque: ${p.stock}</div>
            </div>
            <span style="color: var(--success);">✓ Ativo</span>
          </div>
        `).join('')
      : '<p class="empty-state">Nenhum produto criado</p>';

    document.getElementById('recentProducts').innerHTML = html;
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// ===== Servers =====
async function loadServers() {
  if (!currentUser) return;

  try {
    const guilds = await fetch(`${apiBaseUrl}/admin/discord/guilds`, { credentials: 'include' }).then(r => r.json());

    const html = Array.isArray(guilds) && guilds.length > 0
      ? guilds.map(guild => {
          const icon = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : '/img/default-server.png';
          const status = guild.botInstalled ? 'online' : 'offline';
          return `
            <div class="server-item">
              <img src="${icon}" alt="${guild.name}" class="server-icon">
              <div class="server-name">${guild.name}</div>
              <div class="server-members">👥 ~${Math.floor(Math.random() * 500 + 50)} membros</div>
              <div>
                <span class="server-status ${status}"></span>
                <small>${guild.botInstalled ? 'Bot ativo' : 'Bot ausente'}</small>
              </div>
              ${!guild.botInstalled ? `
                <button class="invite-btn-small" onclick="inviteBot('${guild.id}')">Convidar Bot</button>
              ` : `
                <button class="invite-btn-small" style="background: var(--success);" disabled>Bot Ativo ✓</button>
              `}
            </div>
          `;
        }).join('')
      : '<p class="empty-state">Nenhum servidor encontrado. Faça login novamente!</p>';

    document.getElementById('serversList').innerHTML = html;
  } catch (error) {
    console.error('Erro ao carregar servidores:', error);
    document.getElementById('serversList').innerHTML = '<p class="empty-state">Erro ao carregar servidores</p>';
  }
}

function inviteBot(guildId) {
  window.open(`https://discord.com/oauth2/authorize?client_id=${discordClientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`, '_blank');
}

// ===== Products =====
async function loadProducts() {
  if (!currentUser) return;

  try {
    const products = await fetch(`${apiBaseUrl}/products`, { credentials: 'include' }).then(r => r.json());

    const html = Array.isArray(products) && products.length > 0
      ? products.map(p => `
          <div class="product-item" style="border-left: 4px solid ${p.productColor || '#3b82f6'};">
            <div class="product-image">${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}">` : '📦'}</div>
            <div class="product-info">
              <div class="product-name">${p.name}</div>
              <div class="product-price" style="color: ${p.productColor || '#3b82f6'};">R$ ${(p.priceCents / 100).toFixed(2)}</div>
              <div class="product-description">${p.description || 'Sem descrição'}</div>
              <small style="color: var(--text-secondary);">Estoque: ${p.stock}</small>
              <div class="product-actions" style="margin-top: 1rem;">
                <button class="btn-primary" onclick="editProduct(${p.id})">Editar</button>
                <button class="btn-danger" onclick="deleteProduct(${p.id})">Deletar</button>
              </div>
            </div>
          </div>
        `).join('')
      : '<p class="empty-state">Nenhum produto criado</p>';

    document.getElementById('productsList').innerHTML = html;
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

function openProductModal() {
  if (!currentUser) {
    alert('Faça login primeiro');
    return;
  }
  document.getElementById('productModal').classList.add('active');
  updateGuildSelects();
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
  document.getElementById('productForm').reset();
}

async function handleCreateProduct(e) {
  e.preventDefault();

  const guildId = document.getElementById('productGuild').value;
  const channelId = document.getElementById('productChannel').value;

  const product = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    priceCents: Math.round(parseFloat(document.getElementById('productPrice').value) * 100),
    stock: parseInt(document.getElementById('productStock').value) || 9999,
    imageUrl: document.getElementById('productImage').value || null,
    productColor: document.getElementById('productColor').value || '#3b82f6',
    announcementGuildId: guildId || null,
    announcementChannelId: channelId || null
  };

  try {
    const response = await fetch(`${apiBaseUrl}/products`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    if (response.ok) {
      const createdProduct = await response.json();

      // Anunciar no Discord se selecionou
      if (guildId && channelId) {
        await announceProduct(createdProduct.id, channelId);
      }

      closeProductModal();
      loadProducts();
      loadDashboard();
      alert('✓ Produto criado com sucesso!');
    } else {
      alert('Erro ao criar produto');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao criar produto');
  }
}

async function announceProduct(productId, channelId) {
  try {
    const response = await fetch(`${apiBaseUrl}/products/${productId}/announce`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelId })
    });

    if (response.ok) {
      console.log('✓ Produto anunciado no Discord com sucesso');
    } else {
      console.error('Erro ao anunciar produto:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao anunciar produto:', error);
  }
}

function editProduct(productId) {
  alert('Edição em desenvolvimento');
}

function deleteProduct(productId) {
  if (confirm('Tem certeza que deseja deletar este produto?')) {
    alert('Deleção em desenvolvimento');
  }
}

// ===== Orders =====
async function loadOrders() {
  if (!currentUser) return;

  try {
    const orders = await fetch(`${apiBaseUrl}/orders/me`, { credentials: 'include' }).then(r => r.json());

    const html = Array.isArray(orders) && orders.length > 0
      ? orders.map(o => {
          let paymentInfo = '';
          if (o.Payment && o.Payment.status === 'pending') {
            if (o.Payment.qrCode) {
              paymentInfo = `
                <div style="margin-top: 0.5rem;">
                  <img src="${o.Payment.qrCode}" alt="QR Code PIX" style="max-width: 150px; border: 1px solid var(--border); border-radius: 4px;">
                  <br>
                  <button onclick="copyToClipboard('${o.Payment.pixCopyPaste || o.Payment.qrCode}')">📋 Copiar PIX</button>
                </div>
              `;
            } else if (o.Payment.checkoutLink) {
              paymentInfo = `
                <div style="margin-top: 0.5rem;">
                  <a href="${o.Payment.checkoutLink}" target="_blank" class="btn-primary">💳 Pagar Agora</a>
                </div>
              `;
            }
          }

          return `
            <div class="list-item">
              <div>
                <strong>#${o.id}</strong>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${o.Product?.name || 'Produto'} • R$ ${(o.totalCents / 100).toFixed(2)}</div>
                ${paymentInfo}
              </div>
              <span style="background: rgba(59, 130, 246, 0.1); padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.75rem;">${o.status}</span>
            </div>
          `;
        }).join('')
      : '<p class="empty-state">Nenhum pedido</p>';

    document.getElementById('ordersList').innerHTML = html;
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
  }
}

// ===== Settings =====
async function loadChannelsForGuild(guildId) {
  if (!guildId) {
    document.getElementById('productChannel').innerHTML = '<option value="">Selecione um servidor primeiro</option>';
    document.getElementById('productChannel').disabled = true;
    return;
  }

  try {
    const channels = await fetch(`${apiBaseUrl}/admin/discord/guilds/${guildId}/channels`, {
      credentials: 'include'
    }).then(r => r.json());

    const html = Array.isArray(channels) && channels.length > 0
      ? channels.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
      : '<option value="">Nenhum canal disponível</option>';

    document.getElementById('productChannel').innerHTML = `<option value="">Selecionar canal...</option>${html}`;
    document.getElementById('productChannel').disabled = !Array.isArray(channels) || channels.length === 0;
  } catch (error) {
    console.error('Erro ao carregar canais:', error);
  }
}

async function updateGuildSelects() {
  const selects = ['productGuild', 'settingsGuildSelect', 'logsGuildSelect'];
  const guilds = userGuilds.filter(g => g.botInstalled);

  selects.forEach(id => {
    const html = guilds.length > 0
      ? guilds.map(g => `<option value="${g.id}">${g.name}</option>`).join('')
      : '<option value="">Nenhum servidor disponível</option>';

    const select = document.getElementById(id);
    select.innerHTML = `<option value="">Selecione um servidor...</option>${html}`;
  });
}

async function loadBotConfig() {
  const guildId = document.getElementById('settingsGuildSelect').value;
  if (!guildId) return;

  try {
    const config = await fetch(`${apiBaseUrl}/admin/guild-config/${guildId}`, {
      credentials: 'include'
    }).then(r => r.json());

    document.getElementById('settingsBotName').value = config.botName || '';
    document.getElementById('settingsBotLogo').value = config.botLogo || '';
    document.getElementById('settingsBotBanner').value = config.botCover || '';
    document.getElementById('mpToken').value = config.mercadoPagoToken || '';
  } catch (error) {
    console.error('Erro ao carregar config:', error);
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
async function handleBotConfigSave(e) {
  e.preventDefault();

  const guildId = document.getElementById('settingsGuildSelect').value;
  if (!guildId) {
    alert('Selecione um servidor');
    return;
  }

  const config = {
    guildId,
    botName: document.getElementById('settingsBotName').value,
    botLogo: document.getElementById('settingsBotLogo').value,
    botCover: document.getElementById('settingsBotBanner').value,
    mercadoPagoToken: document.getElementById('mpToken').value || null
  };

  try {
    const response = await fetch(`${apiBaseUrl}/admin/guild-config`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (response.ok) {
      alert('✓ Configurações salvas com sucesso!');
    } else {
      alert('Erro ao salvar configurações');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao salvar configurações');
  }
}

// ===== Utility Functions =====
async function fetchJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  return response.json();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Código PIX copiado para a área de transferência!');
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    // Fallback para browsers antigos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Código PIX copiado!');
  });
}