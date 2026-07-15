import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../redux/slices/portfolioSlice';
import { History, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const TransactionHistoryPage = () => {
  const dispatch = useDispatch();
  const { transactions, txPagination, isLoading } = useSelector((state) => state.portfolio);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTransactions({
      search: searchTerm,
      type: selectedType,
      page: currentPage
    }));
  }, [dispatch, searchTerm, selectedType, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= txPagination.pages) {
      setCurrentPage(newPage);
    }
  };

  // CSV Export utility
  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.warning('No transactions found to export');
      return;
    }

    const headers = ['Symbol', 'Transaction Type', 'Quantity', 'Share Price (INR)', 'Total Value (INR)', 'Timestamp'];
    const csvRows = [headers.join(',')];

    transactions.forEach((tx) => {
      const row = [
        tx.symbol,
        tx.type.toUpperCase(),
        tx.quantity,
        tx.price.toFixed(2),
        tx.total.toFixed(2),
        new Date(tx.timestamp).toISOString()
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sb_stocks_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV ledger downloaded successfully');
  };

  return (
    <div className="container-fluid p-0 animate-fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold m-0" style={{ color: 'var(--text-primary)' }}>Transaction Ledger</h2>
          <p className="text-muted small m-0" style={{ color: 'var(--text-secondary)' }}>
            Complete audit trail of all bought and sold securities
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          className="btn btn-premium d-flex align-items-center gap-2"
          disabled={transactions.length === 0}
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters control bar */}
      <div className="sb-card p-3 mb-4 d-flex flex-column flex-md-row gap-3 align-items-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Search */}
        <div className="position-relative flex-grow-1 w-100">
          <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="sb-input ps-5"
            placeholder="Search by stock symbol (e.g. NVDA)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Type select */}
        <select
          className="sb-input py-2 w-100 w-md-auto"
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
          style={{ minWidth: '150px' }}
        >
          <option value="All">All Actions</option>
          <option value="buy">Buy Orders</option>
          <option value="sell">Sell Orders</option>
        </select>
      </div>

      {/* Ledger card */}
      <div className="sb-card p-4 mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {isLoading ? (
          <div className="d-flex flex-column gap-3 py-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="skeleton" style={{ height: '50px', width: '100%' }}></div>
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <>
            <div className="sb-table-container">
              <table className="sb-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total Value</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isBuy = tx.type === 'buy';
                    return (
                      <tr key={tx._id}>
                        <td className="fw-bold">{tx.symbol}</td>
                        <td>
                          <span className={`fw-semibold text-uppercase px-2.5 py-1 rounded`}
                                style={{
                                  backgroundColor: tx.type === 'buy' ? 'rgba(239,68,68,0.1)' : tx.type === 'sell' ? 'rgba(16,185,129,0.1)' : 'rgba(0,208,156,0.1)',
                                  color: tx.type === 'buy' ? 'var(--danger-color)' : tx.type === 'sell' ? 'var(--success-color)' : 'var(--accent-color)',
                                  padding: '0.2rem 0.5rem',
                                  fontSize: '0.8rem',
                                  borderRadius: '6px'
                                }}>
                            {tx.type}
                          </span>
                        </td>
                        <td>{tx.quantity}</td>
                        <td>₹{tx.price.toFixed(2)}</td>
                        <td className="fw-bold">₹{tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="text-secondary small" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {txPagination.pages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 border-top border-color pt-3">
                <span className="small text-muted" style={{ color: 'var(--text-muted)' }}>
                  Showing Page {txPagination.page} of {txPagination.pages} ({txPagination.total} entries)
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-premium-outline py-2 px-3 d-flex align-items-center justify-content-center"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="btn btn-premium-outline py-2 px-3 d-flex align-items-center justify-content-center"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === txPagination.pages}
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 text-muted border border-dashed rounded-3" style={{ color: 'var(--text-muted)', borderStyle: 'dashed !important', borderColor: 'var(--border-color) !important' }}>
            <History size={48} className="mb-3 opacity-50" />
            <h5 className="fw-bold">No transactions logged</h5>
            <p className="small mb-0">Your trading history is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
