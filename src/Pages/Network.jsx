import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../Components/Layout/Dashboardlayout';
import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

import api from '../api/api';

// ============================================
// ROLE STYLE HELPERS
// ============================================

const getNodeType = (node, level) => {
  if (node.type === 'company') return 'company';

  if (level === 1) return 'direct_member';

  return 'connected_member';
};

const getRoleLabel = (node, level) => {
  const type = getNodeType(node, level);

  if (type === 'company') return 'Company';
  if (type === 'direct_member') return 'Direct Member';

  return 'Connected Member';
};

const getGlowClass = (node, level) => {
  const type = getNodeType(node, level);

  if (type === 'company') {
    return 'shadow-[0_0_35px_#2563eb]';
  }

  if (type === 'direct_member') {
    return 'shadow-[0_0_30px_#22c55e]';
  }

  return 'shadow-[0_0_30px_#ef4444]';
};

const getPulseClass = (node, level) => {
  const type = getNodeType(node, level);

  if (type === 'company') {
    return 'bg-blue-500';
  }

  if (type === 'direct_member') {
    return 'bg-green-500';
  }

  return 'bg-red-500';
};

const getTextClass = (node, level) => {
  const type = getNodeType(node, level);

  if (type === 'company') {
    return 'text-blue-600';
  }

  if (type === 'direct_member') {
    return 'text-green-600';
  }

  return 'text-red-500';
};

const getImageUrl = (node) => {
  if (node.image) return node.image;

  if (node.type === 'company') {
    return 'https://ui-avatars.com/api/?name=Company&background=2563eb&color=ffffff&bold=true';
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    node.name || 'Member'
  )}&background=111827&color=ffffff&bold=true`;
};

// ============================================
// TREE NODE COMPONENT
// ============================================

const TreeNode = ({ node, level = 0 }) => {
  const [open, setOpen] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        y: !open && level === 0 ? 120 : 0,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
        delay: level * 0.15,
      }}
      className={`
        flex
        flex-col
        items-center
        relative
        transition-all
        duration-700
        ${
          !open && level === 0
            ? 'justify-center min-h-[60vh]'
            : ''
        }
      `}
    >
      {/* NODE */}
      <motion.div
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.95,
        }}
        className="
          relative
          flex
          flex-col
          items-center
        "
      >
        {/* GLOW EFFECT */}
        <div
          className={`
            relative
            rounded-full
            p-1
            ${getGlowClass(node, level)}
          `}
        >
          {/* PULSE */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            className={`
              absolute
              inset-0
              rounded-full
              ${getPulseClass(node, level)}
              -z-10
            `}
          />

          {/* PROFILE IMAGE */}
          <motion.img
            onClick={() => setShowDetails(true)}
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
            whileHover={{
              scale: 1.1,
            }}
            src={getImageUrl(node)}
            alt={node.name}
            className="
              w-16
              h-16
              rounded-full
              border-4
              border-white
              object-cover
              bg-white
              cursor-pointer
            "
          />
        </div>

        {/* NAME */}
        <p
          className={`
            mt-2
            text-xs
            font-semibold
            text-center
            max-w-[140px]
            ${getTextClass(node, level)}
          `}
        >
          {node.name}
        </p>

        {/* ROLE */}
        <p className="text-[10px] text-gray-500 font-medium">
          {getRoleLabel(node, level)}
        </p>

        {/* EXPAND BUTTON */}
        {hasChildren && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            whileHover={{
              rotate: 180,
            }}
            className="
              absolute
              -right-4
              top-4
              bg-white
              text-black
              rounded-full
              p-1
              shadow-md
              border
            "
          >
            {open ? (
              <ChevronDown size={10} />
            ) : (
              <ChevronRight size={10} />
            )}
          </motion.button>
        )}
      </motion.div>

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() => setShowDetails(false)}
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/50
              backdrop-blur-sm
            "
          >
            <motion.div
              initial={{
                scale: 0.7,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.7,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              onClick={(e) => e.stopPropagation()}
              className="
                bg-white
                rounded-3xl
                shadow-2xl
                p-6
                w-[340px]
                relative
              "
            >
              {/* CLOSE */}
              <button
                onClick={() => setShowDetails(false)}
                className="
                  absolute
                  top-3
                  right-3
                  bg-gray-100
                  hover:bg-gray-200
                  rounded-full
                  p-2
                "
              >
                ✕
              </button>

              {/* PROFILE */}
              <div className="flex flex-col items-center">
                <img
                  src={getImageUrl(node)}
                  alt={node.name}
                  className="
                    w-24
                    h-24
                    rounded-full
                    border-4
                    border-white
                    shadow-xl
                    object-cover
                  "
                />

                <h2 className="mt-4 text-xl font-bold text-gray-800 text-center">
                  {node.name}
                </h2>

                <p
                  className={`
                    mt-1
                    font-semibold
                    ${getTextClass(node, level)}
                  `}
                >
                  {getRoleLabel(node, level)}
                </p>

                {/* DETAILS */}
                <div className="w-full mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Member ID
                    </span>

                    <span className="font-semibold">
                      {node.code || node.id || 'COMPANY'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Email
                    </span>

                    <span className="font-semibold text-right text-xs">
                      {node.email || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Connected Members
                    </span>

                    <span className="font-semibold">
                      {node.children?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Total Orders
                    </span>

                    <span className="font-semibold">
                      {node.total_orders || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Commission
                    </span>

                    <span className="font-semibold text-green-600">
                      ₹{Number(node.total_commission || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Status
                    </span>

                    <span className="text-green-500 font-semibold">
                      {node.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHILDREN */}
      <AnimatePresence>
        {hasChildren && open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="
              flex
              flex-col
              items-center
            "
          >
            {/* VERTICAL LINE */}
            <motion.div
              initial={{
                height: 0,
              }}
              animate={{
                height: 30,
              }}
              transition={{
                duration: 0.3,
              }}
              className="
                w-[2px]
                bg-gray-300
              "
            />

            {/* CHILD NODES */}
            <div className="relative flex gap-8 justify-center flex-wrap">
              {/* HORIZONTAL LINE */}
              {node.children.length > 1 && (
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: '80%',
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="
                    absolute
                    top-0
                    left-[10%]
                    h-[2px]
                    bg-gray-300
                  "
                />
              )}

              {/* CHILD ITEMS */}
              {node.children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{
                    opacity: 0,
                    y: -20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.15,
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                  "
                >
                  {/* CONNECTOR */}
                  <motion.div
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: 30,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="
                      w-[2px]
                      bg-gray-300
                    "
                  />

                  {/* CHILD */}
                  <TreeNode
                    node={child}
                    level={level + 1}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

const Network = () => {
  const [membersTree, setMembersTree] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNetwork = async () => {
    try {
      setLoading(true);

      const response = await api.get('/agents/hierarchy/tree');

      setMembersTree(response.data);
    } catch (error) {
      console.error('Failed to load network:', error);
      alert('Failed to load network. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  const rootNode = useMemo(
    () => ({
      id: 'company-root',
      code: 'COMPANY',
      name: 'Company',
      type: 'company',
      image:
        'https://ui-avatars.com/api/?name=Company&background=2563eb&color=ffffff&bold=true',
      children: membersTree,
    }),
    [membersTree]
  );

  return (
    <DashboardLayout title="Network Hierarchy">
      <div className="p-4">
        <div
          className="
            h-[100vh]
            w-full
            rounded-xl
            bg-white
            p-6
            overflow-hidden
            shadow-xl
            border
            border-gray-200
          "
        >
          {/* HEADER */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Company Network
            </h1>

            <p className="text-gray-500 mt-2">
              Company → Direct Members → Connected Members
            </p>

            <div className="mt-4 flex justify-center">
              <button
                onClick={fetchNetwork}
                className="
                  bg-blue-600
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  hover:bg-blue-700
                  flex
                  items-center
                  gap-2
                "
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Network
              </button>
            </div>
          </div>

          {/* TREE */}
          <div
            className="
              flex
              justify-center
              items-start
              h-full
              overflow-y-auto
              overflow-x-hidden
              pb-32
            "
          >
            {loading ? (
              <p className="text-gray-500 mt-20">
                Loading network...
              </p>
            ) : rootNode.children.length === 0 ? (
              <div className="text-center mt-20">
                <TreeNode node={rootNode} />

                <p className="text-gray-500 mt-8">
                  No direct members joined to company yet.
                </p>
              </div>
            ) : (
              <TreeNode node={rootNode} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Network;